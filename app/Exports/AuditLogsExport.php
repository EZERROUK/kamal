<?php

namespace App\Exports;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Spatie\Activitylog\Models\Activity;
use Carbon\Carbon;

class AuditLogsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct(Request $request)
    {
        $this->filters = $request;
    }

    public function collection(): Collection
    {
        $query = Activity::with('causer')->latest();

        if ($this->filters->filled('search')) {
            $search = $this->filters->search;
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

        if ($this->filters->filled('user')) {
            $userInput = trim(strtolower($this->filters->user));
            if ($userInput === '__system__') {
                $query->whereNull('causer_id');
            } else {
                $query->whereHas('causer', function ($q) {
                    $q->where('name', 'like', '%' . $this->filters->user . '%')
                      ->orWhere('email', 'like', '%' . $this->filters->user . '%');
                });
            }
        }

        if ($this->filters->filled('action')) {
            $query->where('description', 'like', '%' . $this->filters->action . '%');
        }

        if ($this->filters->filled('start_date') && $this->filters->filled('end_date')) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->filters->start_date)->startOfMinute(),
                Carbon::parse($this->filters->end_date)->endOfMinute(),
            ]);
        }

        return $query->get()->map(function ($activity) {
            return [
                'ID' => $activity->id,
                'Utilisateur' => optional($activity->causer)->name ?? 'Système',
                'Action' => $activity->description,
                'Modèle' => class_basename($activity->subject_type),
                'Date' => $activity->created_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Utilisateur',
            'Action',
            'Modèle',
            'Date',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A90E2'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle('A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }
}
