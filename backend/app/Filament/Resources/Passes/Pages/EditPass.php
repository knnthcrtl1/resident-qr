<?php

namespace App\Filament\Resources\Passes\Pages;

use App\Filament\Resources\Passes\PassResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPass extends EditRecord
{
    protected static string $resource = PassResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
