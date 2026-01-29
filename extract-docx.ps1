$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open('c:\Users\Baroroy\Downloads\PRD-Customer-Profile-Dashboard.docx')
$doc.Content.Text
$doc.Close()
$word.Quit()
