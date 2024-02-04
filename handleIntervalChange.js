let intervalsList = document.querySelector('.intervals');
intervalsList.addEventListener('change', handleIntervalChange);

function handleIntervalChange(e) {
    document.forms[0].submit();
}