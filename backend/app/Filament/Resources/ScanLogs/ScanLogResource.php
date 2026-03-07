<?php

namespace App\Filament\Resources\ScanLogs;

use App\Filament\Resources\ScanLogs\Pages\CreateScanLog;
use App\Filament\Resources\ScanLogs\Pages\EditScanLog;
use App\Filament\Resources\ScanLogs\Pages\ListScanLogs;
use App\Filament\Resources\ScanLogs\Schemas\ScanLogForm;
use App\Filament\Resources\ScanLogs\Tables\ScanLogsTable;
use App\Models\ScanLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ScanLogResource extends Resource
{
    protected static ?string $model = ScanLog::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return ScanLogForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ScanLogsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListScanLogs::route('/'),
            'create' => CreateScanLog::route('/create'),
            'edit' => EditScanLog::route('/{record}/edit'),
        ];
    }
}
