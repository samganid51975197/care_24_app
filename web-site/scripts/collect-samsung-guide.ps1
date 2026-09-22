$ErrorActionPreference = 'Stop'
$origin = 'https://www.samsunghospital.com'
$buildings = @(@{id='hospital';name='본관';first='1F'},@{id='cancer';name='암병원';first='6F'},@{id='etc';name='별관';first='5F'},@{id='proton';name='양성자치료센터';first='B1F'})
$result = @()
foreach ($building in $buildings) {
  $firstUrl = "$origin/_newhome/info/guide/$($building.id)/$($building.first).html"
  $firstHtml = (Invoke-WebRequest -Uri $firstUrl -TimeoutSec 30).Content
  $links = [regex]::Matches($firstHtml, '/_newhome/info/guide/'+$building.id+'/([B0-9]+F)\.html') | ForEach-Object {$_.Groups[1].Value} | Select-Object -Unique
  $floors = @($links | ForEach-Object -Parallel {
    $buildingId = $using:building.id
    $source = 'https://www.samsunghospital.com/_newhome/info/guide/'+$buildingId+'/'+$_+'.html'
    $html = (Invoke-WebRequest -Uri $source -TimeoutSec 30).Content
    $list = [regex]::Match($html,'(?s)<ol>(.*?)</ol>').Groups[1].Value
    $labels = @([regex]::Matches($list,'<span>(.*?)</span>') | ForEach-Object {[System.Net.WebUtility]::HtmlDecode(($_.Groups[1].Value -replace '<[^>]+>','')).Trim()})
    $plan = [regex]::Match($html,'<figure>\s*<img src="([^"]+)"').Groups[1].Value
    if($html -notmatch '<h1>'){throw "Invalid floor page: $source"}
    [pscustomobject]@{id=$_;label=($_ -replace '^B','지하 ' -replace 'F$','층');source=$source;facilities=@($labels | Where-Object {$_});planUrl=if($plan){'https://www.samsunghospital.com'+$plan}else{''};hasWard=[bool]($labels -match '병동\(|중환자실|신생아실|낮병동|이식병동|분만장')}
  } -ThrottleLimit 4)
  $result += [pscustomobject]@{id=$building.id;name=$building.name;floors=@($floors | Sort-Object {if($_.id.StartsWith('B')){-[int]($_.id -replace '[BF]','')}else{[int]($_.id -replace 'F','')}} -Descending)}
}
$out = [pscustomobject]@{name='삼성서울병원';hospitalIds=@('hospital-5');address='서울특별시 강남구 일원로 81';checkedAt='2026-09-20';buildings=$result}
$out | ConvertTo-Json -Depth 10 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot '../lib/samsung-guide.json')
$result | ForEach-Object { Write-Output ($_.name+': '+$_.floors.Count+' floors'); $_.floors | ForEach-Object {Write-Output ($_.label+': '+($_.facilities -join ', '))} }
