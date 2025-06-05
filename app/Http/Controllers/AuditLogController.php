<?php

namespace App\Http\Controllers;

use App\Exports\AuditLogsExport;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class AuditLogController extends Controller
{
    public function index(Request $request)
{
    $query = Activity::query()->with('causer');

    // Recherche texte global
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%$search%")
              ->orWhere('subject_type', 'like', "%$search%")
              ->orWhere('subject_id', 'like', "%$search%")
              ->orWhereHas('causer', function ($cq) use ($search) {
                  $cq->where('name', 'like', "%$search%")
                     ->orWhere('email', 'like', "%$search%");
              });
        });
    }

    // Filtres utilisateur/action
    if ($request->filled('user')) {
        $userInput = trim(strtolower($request->user));
        if ($userInput === '__system__') {
            $query->whereNull('causer_id');
        } else {
            $query->whereHas('causer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->user . '%')
                  ->orWhere('email', 'like', '%' . $request->user . '%');
            });
        }
    }

    if ($request->filled('action')) {
        $query->where('description', 'like', '%' . $request->action . '%');
    }

    if ($request->filled('start_date') && $request->filled('end_date')) {
        $query->whereBetween('created_at', [
            Carbon::parse($request->start_date)->startOfMinute(),
            Carbon::parse($request->end_date)->endOfMinute(),
        ]);
    }

    // Tri
    $sort = $request->input('sort', 'created_at');
    $direction = $request->input('direction', 'desc');
    if (in_array($sort, ['created_at', 'description']) && in_array($direction, ['asc', 'desc'])) {
        $query->orderBy($sort, $direction);
    }

    // Pagination
    $logs = $query->paginate($request->input('per_page', 10))->appends($request->all());

    // ✅ Ajout de valeurs par défaut pour `filters`
    $filters = array_merge([
        'user' => null,
        'action' => null,
        'search' => null,
        'start_date' => null,
        'end_date' => null,
        'sort' => 'created_at',
        'direction' => 'desc',
        'per_page' => 10,
    ], $request->only([
        'user', 'action', 'search', 'start_date', 'end_date', 'sort', 'direction', 'per_page',
    ]));

    return Inertia::render('audit-logs/Index', [
        'logs' => $logs,
        'filters' => $filters,
    ]);
}


    public function export(Request $request)
    {
        return Excel::download(new AuditLogsExport($request), 'audit_logs.xlsx');
    }
}
