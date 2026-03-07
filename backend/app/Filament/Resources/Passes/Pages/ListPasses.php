<?php

namespace App\Filament\Resources\Passes\Pages;

use App\Filament\Resources\Passes\PassResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPasses extends ListRecords
{
    protected static string $resource = PassResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
