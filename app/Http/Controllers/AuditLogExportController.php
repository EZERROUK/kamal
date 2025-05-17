<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Spatie\Activitylog\Models\Activity;
use Maatwebsite\Excel\Facades\Excel;

class AuditLogExportController extends Controller implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        return Activity::with(['causer', 'subject'])->get()->map(function ($log) {
            // Formatage des détails de l'action
            $details = '';

            if ($log->description === 'Modification des rôles') {
                $properties = $log->properties->toArray();

                $details = "Modifications des rôles pour l'utilisateur {$log->subject->name}:\n";

                if (!empty($properties['roles_précédents'])) {
                    $details .= "- Anciens rôles: " . implode(', ', $properties['roles_précédents']) . "\n";
                }

                if (!empty($properties['nouveaux_roles'])) {
                    $details .= "- Nouveaux rôles: " . implode(', ', $properties['nouveaux_roles']) . "\n";
                }

                if (!empty($properties['roles_ajoutés'])) {
                    $details .= "- Rôles ajoutés: " . implode(', ', $properties['roles_ajoutés']) . "\n";
                }

                if (!empty($properties['roles_supprimés'])) {
                    $details .= "- Rôles supprimés: " . implode(', ', $properties['roles_supprimés']);
                }
            } elseif ($log->description === 'Changement de mot de passe') {
                $properties = $log->properties->toArray();
                $details = "Le mot de passe de l'utilisateur \"{$log->subject->name}\" a été modifié";
            } else {
                // Skip empty updates
                if ($log->description === 'updated' && (!$log->properties || $log->properties->count() === 0)) {
                    return null;
                }

                if ($log->properties && $log->properties->count() > 0) {
                    $properties = $log->properties->toArray();

                    if (isset($properties['attributes']) && count($properties['attributes']) > 0) {
                        $hasChanges = false;
                        $tempDetails = "";
                        foreach ($properties['attributes'] as $key => $value) {
                            if ($key !== 'password' && $key !== 'remember_token' && !empty($value)) {
                                $oldValue = isset($properties['old'][$key]) ? $properties['old'][$key] : 'non défini';
                                $tempDetails .= "- $key: $oldValue → $value\n";
                                $hasChanges = true;
                            }
                        }
                        $details = $hasChanges ? $tempDetails : "Aucune modification n'a été apportée";
                    }
                }
            }

            // Skip entries with empty details
            if (empty(trim($details))) {
                return null;
            }

            return [
                'ID' => $log->id,
                'Utilisateur' => $log->causer?->name ?? 'Système',
                'Email' => $log->causer?->email ?? 'N/A',
                'Action' => $log->description,
                'Type' => $log->subject_type,
                'ID Sujet' => $log->subject_id,
                'Détails' => $details,
                'Date' => $log->created_at->format('d/m/Y H:i:s'),
            ];
        })->filter(); // Remove null entries
    }

    public function headings(): array
    {
        return [
            'ID',
            'Utilisateur',
            'Email',
            'Action',
            'Type',
            'ID Sujet',
            'Détails',
            'Date',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style pour l'en-tête
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A5568'], // Gris foncé
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Style pour toutes les cellules
        $sheet->getStyle('A1:H' . $sheet->getHighestRow())->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'], // Gris clair
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Centrage pour les colonnes ID, Type, ID Sujet et Date
        $sheet->getStyle('A2:A' . $sheet->getHighestRow())->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('E2:F' . $sheet->getHighestRow())->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('H2:H' . $sheet->getHighestRow())->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Ajustement du format pour la colonne Détails
        $sheet->getStyle('G2:G' . $sheet->getHighestRow())->getAlignment()->setWrapText(true);

        // Hauteur de la première ligne
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Style alterné pour les lignes
        for ($row = 2; $row <= $sheet->getHighestRow(); $row++) {
            if ($row % 2 == 0) {
                $sheet->getStyle('A' . $row . ':H' . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F7FAFC'], // Gris très clair
                    ],
                ]);
            }
        }

        return $sheet;
    }

    public function export()
    {
        return Excel::download($this, 'journal_activites_' . now()->format('d-m-Y_H-i-s') . '.xlsx');
    }
}
