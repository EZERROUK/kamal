<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class LoginLogController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);

        return Inertia::render('login-logs/Index', [
            'logs' => LoginLog::with('user')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->through(function ($log) {
                    return [
                        'id' => $log->id,
                        'user' => [
                            'name' => $log->user?->name ?? 'Utilisateur inconnu',
                            'email' => $log->user?->email ?? 'N/A'
                        ],
                        'ip_address' => $log->ip_address,
                        'user_agent' => $log->user_agent,
                        'location' => $log->location,
                        'status' => $log->status,
                        'created_at' => $log->created_at->format('Y-m-d H:i:s')
                    ];
                })
        ]);
    }
}
