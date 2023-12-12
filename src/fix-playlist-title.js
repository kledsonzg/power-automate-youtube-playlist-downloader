function ExecuteScript() 
{ 
	const caracteres = ' 0123456789abcdefghijklmnopqrstuvwxyz-_()';
    //'$title' é uma váriavel do Power Automate.
	const _title = $title;
	let fixedTitle = '';

    for(let i = 0; i < _title.length; i++){
        if( caracteres.includes(_title[i].toLowerCase() ) == false)
            continue;

        fixedTitle += _title[i];
    }

	return fixedTitle;
}