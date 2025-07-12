<?php

namespace App\Console\Commands;

use App\Models\Quote;
use Illuminate\Console\Command;

class ExpireQuotes extends Command
{
    protected $signature = 'quotes:expire';
    protected $description = 'Marquer les devis expirés automatiquement';

    public function handle(): int
    {
        $expiredQuotes = Quote::expired()->get();

        $count = 0;
        foreach ($expiredQuotes as $quote) {
            $quote->markAsExpired();
            $count++;
        }

        $this->info("$count devis marqués comme expirés.");

        return 0;
    }
}