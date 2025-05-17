<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = User::with('roles');

        if ($request->has('role') && $request->role) {
            $query = $query->whereHas('roles', function ($query) use ($request) {
                $query->where('name', $request->role);
            });
        }

        if ($user && $user->hasRole('SuperAdmin')) {
            $query = $query->withTrashed();
        }

        $users = $query->get();

        $roles = \Spatie\Permission\Models\Role::pluck('name')->toArray();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }


    public function export()
    {
        return Excel::download(new UsersExport, 'utilisateurs.xlsx');
    }
    public function create()
    {
        $user = Auth::user();

        $roles = Role::query();

        if (!$user->hasRole('SuperAdmin')) {
            $roles = $roles->where('name', '!=', 'SuperAdmin');
        }

        return Inertia::render('Users/Create', [
            'roles' => $roles->get()
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
           'password' => 'required|string|min:10|confirmed|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/',
            'role' => 'required|string|exists:roles,name'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'Utilisateur créé avec succès.');
    }

    public function show($id)
    {
        $user = User::findOrFail($id);

        // Get all roles for this user using Spatie's roles() relationship
        $userRoles = $user->roles()->pluck('name');

        return Inertia::render('Users/Show', [
            'user' => $user,
            'userRoles' => $userRoles,
        ]);
    }


    public function edit(User $user)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();
        $roles = Role::query();

        if (!$authUser->hasRole('SuperAdmin')) {
            $roles = $roles->where('name', '!=', 'SuperAdmin');
        }

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles->get(),
            'userRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:10|confirmed|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/',
            'roles' => 'required|array',
        ]);

        // Get current roles before updating
        $previousRoles = $user->roles->pluck('name')->toArray();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ? bcrypt($validated['password']) : $user->password,
        ]);

        if (!empty($validated['password'])) {
            activity('user')
                ->performedOn($user)
                ->causedBy(Auth::user())
                ->withProperties([
                    "Utilisateur" => $user->name,
                    'info' => 'Mot de passe modifié',
                ])
                ->log('Changement de mot de passe');
        }

        // Sync roles
        $user->syncRoles($validated['roles']);

        // Get updated roles after syncing
        $newRoles = $user->roles->pluck('name')->toArray();

        // Check if roles have changed
        $rolesChanged = count(array_diff($previousRoles, $newRoles)) > 0 || count(array_diff($newRoles, $previousRoles)) > 0;

        // Log role changes if they occurred
        if ($rolesChanged) {
            $addedRoles = array_diff($newRoles, $previousRoles);
            $removedRoles = array_diff($previousRoles, $newRoles);

            activity('user')
                ->performedOn($user)
                ->causedBy(Auth::user())
                ->withProperties([
                    "Utilisateur" => $user->name,
                    'info' => 'Rôles modifiés',
                    'roles_précédents' => $previousRoles,
                    'nouveaux_roles' => $newRoles,
                    'roles_ajoutés' => $addedRoles,
                    'roles_supprimés' => $removedRoles
                ])
                ->log('Modification des rôles');
        }

        return redirect()->route('users.index')->with('message', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Si tu veux gérer une soft delete, voici la méthode
        $user->delete();

        return redirect()->route('users.index')->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->back()->with('success', 'Utilisateur restauré avec succès.');
    }

    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->forceDelete();

        return redirect()->route('users.index')->with('success', 'Utilisateur supprimé définitivement.');
    }
}
