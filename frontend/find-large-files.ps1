Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts -Exclude *.test.tsx,*.test.ts | 
    ForEach-Object { 
        $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
        [PSCustomObject]@{
            Lines = $lines
            Path = $_.FullName.Replace((Get-Location).Path + '\', '')
        }
    } | 
    Where-Object { $_.Lines -gt 200 } | 
    Sort-Object -Property Lines -Descending | 
    Select-Object -First 20
