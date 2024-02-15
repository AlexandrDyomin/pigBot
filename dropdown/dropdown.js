document.querySelectorAll('.dropdown__btn').forEach((btn) => {
    btn.addEventListener('pointerdown', handleDropdownBtn);
});

document.querySelectorAll('.dropdown').forEach((dropdown) => {
    dropdown.addEventListener('keydown', handleDropdownPointerdown);
    dropdown.addEventListener('focusout', handleDropdownFocusout);
});

function handleDropdownBtn(e) {
    var dropdown = e.target.closest('.dropdown');
    switchDropdownState(dropdown);
}

function handleDropdownPointerdown(e) {
    var dropdown = e.currentTarget;
    var code = e.code;
    var codes = {
        Space: () => {
            if (e.target.classList.contains('dropdown__check')) {
                return;
            }
            switchDropdownState(dropdown);
            dropdown.querySelector('.dropdown__btn').focus();
        },
        Enter: () => {
            if (e.target.classList.contains('dropdown__check')) {
                return;
            }
            switchDropdownState(dropdown);
            dropdown.querySelector('.dropdown__btn').focus();
        },
        Escape: () => closeDropdown(dropdown),
        ArrowUp: () => {
            if (e.currentTarget.querySelector('.dropdown__btn_active')) {
                e.preventDefault();
                selectDropdownLink('prev');
            }
        },
        ArrowDown: () => {
            if (e.currentTarget.querySelector('.dropdown__btn_active')) {
                e.preventDefault();
                selectDropdownLink('next');
            }
        },
    };
    codes[code]?.();

    function selectDropdownLink(pos) {
        var activeElementIsDropdownLink =
            document.activeElement.classList.contains('dropdown__check');
        var firstDropdownLink = dropdown.querySelector(
            '.dropdown__item > .dropdown__check',
        );
        var lastDropdownLink = dropdown.querySelector(
            '.dropdown__item:last-child > .dropdown__check',
        );

        if (pos === 'next') {
            var activeElementIsNotExtremeLink =
                document.activeElement !== lastDropdownLink;
            var extremeLink = firstDropdownLink;
            var linkSibling =
                document.activeElement.parentElement.nextElementSibling
                    ?.children[0];
        }

        if (pos === 'prev') {
            activeElementIsNotExtremeLink =
                document.activeElement !== firstDropdownLink;
            extremeLink = lastDropdownLink;
            linkSibling =
                document.activeElement.parentElement.previousElementSibling
                    ?.children[0];
        }

        var link =
            activeElementIsDropdownLink && activeElementIsNotExtremeLink
                ? linkSibling
                : extremeLink;

        link.focus();
    }
}

function handleDropdownFocusout(e) {
    var isRelatedTargetInsideDropdownList =
        e.relatedTarget && e.relatedTarget.className.match(/dropdown/);

    if (isRelatedTargetInsideDropdownList) {
        return;
    }

    var dropdown = e.target.closest('.dropdown');
    closeDropdown(dropdown);
}

function closeDropdown(dropdownElement) {
    var dropdownBtn = dropdownElement.querySelector('.dropdown__btn');
    dropdownBtn.classList.remove('dropdown__btn_active');
    dropdownBtn.removeAttribute('tabindex');
    var dropdownList = dropdownElement.querySelector('.dropdown__list');
    dropdownList.classList.remove('dropdown__list_open');
}

function openDropdown(dropdownElement) {
    var dropdownBtn = dropdownElement.querySelector('.dropdown__btn');
    dropdownBtn.classList.add('dropdown__btn_active');
    dropdownBtn.setAttribute('tabindex', '-1');
    var dropdownList = dropdownElement.querySelector('.dropdown__list');
    dropdownList.classList.add('dropdown__list_open');
}

function switchDropdownState(dropdownElement) {
    var dropdownBtnActive = dropdownElement.querySelector(
        '.dropdown__btn_active',
    );

    if (dropdownBtnActive) {
        closeDropdown(dropdownElement);
    } else {
        openDropdown(dropdownElement);
    }
}
