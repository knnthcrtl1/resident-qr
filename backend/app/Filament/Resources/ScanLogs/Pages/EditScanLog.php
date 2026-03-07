<?php

namespace App\Filament\Resources\ScanLogs\Pages;

use App\Filament\Resources\ScanLogs\ScanLogResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditScanLog extends EditRecord
{
    protected static string $resource = ScanLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
