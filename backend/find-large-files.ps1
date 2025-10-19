Get-ChildItem -Path "." -Recurse -Include *.py -Exclude *test*.py,*__pycache__* | 
    ForEach-Object { 
        $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
        [PSCustomObject]@{
            Lines = $lines
            Path = $_.FullName.Replace((Get-Location).Path + '\', '')
        }
    } | 
    Where-Object { $_.Lines -gt 150 } | 
    Sort-Object -Property Lines -Descending | 
    Select-Object -First 15
