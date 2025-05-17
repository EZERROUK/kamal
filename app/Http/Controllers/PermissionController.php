<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $permissionsQuery = Permission::query();

        if ($isSuperAdmin) {
            $permissionsQuery->withTrashed();
        }

        $permissions = $permissionsQuery->get();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
            'isSuperAdmin' => $isSuperAdmin
        ]);
    }

    public function create()
    {
        return Inertia::render('Permissions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        Permission::create(['name' => $validated['name']]);

        return redirect()->route('permissions.index')->with('success', 'Permission créée avec succès.');
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $permission->id,
        ]);

        $permission->update(['name' => $validated['name']]);

        return redirect()->route('permissions.index')->with('success', 'Permission mise à jour avec succès.');
    }

    public function destroy($id)
{
    try {
        $permission = Permission::findOrFail($id);

        $permission->delete();

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permission supprimée avec succès.');
    } catch (\Exception $e) {
        return redirect()
            ->route('permissions.index')
            ->with('error', 'Une erreur est survenue lors de la suppression de la permission.');
    }
}


    public function restore($id)
    {
        $permission = Permission::withTrashed()->findOrFail($id);
        $permission->restore();

        return redirect()->route('permissions.index')->with('success', 'Permission restaurée avec succès.');
    }
}
