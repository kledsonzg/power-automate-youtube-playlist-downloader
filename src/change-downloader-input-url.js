function ExecuteScript() 
{ 
    let inputElement = document.getElementsByClassName('search')[0].childNodes[0];

    inputElement.value = '%item%';
    inputElement.dispatchEvent(new Event('input') );
}