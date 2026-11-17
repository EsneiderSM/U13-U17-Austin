var validationSummaryHeadingSingle = window.validationSummaryHeadingSingle || "Your form contains 1 error, linked below.";
var validationSummaryHeadingMultiple = window.validationSummaryHeadingMultiple || "Your form contains {0} errors, listed below with a link to each field.";

$(function () {
    var forms = $('form');
    forms.each(function (index) {
        if ($.data(forms[index], 'validator')) {
            // Callback function when the form fails validation
            $(forms[index]).bind('invalid-form.validate',
                function (form, validator) {
                    $(forms[index]).find('button[type="submit"]').each(function () {
                        $(this).removeAttr('data-form-submitting');
                        $(this).removeAttr('disabled');
                    });
                });
            // Callback function when the form passes validation
            $(forms[index]).data('validator').settings.submitHandler = function (form) {
                form.submit();
                $(forms[index]).find('button[type="submit"]').each(function () {
                    var button = $(this);
                    button.attr('data-form-submitting', 'true');
                    button.attr('disabled', 'disabled');
                    // This is to try and get around a safari bug where adding/removing disabled attribute does not visually update
                    $(window).trigger('resize');
                });
            }
            var settings = $.data(forms[index], 'validator').settings;
            settings.showErrors = ShowErrors;
            settings.focusInvalid = false;
            settings.onfocusout = false;
            settings.onkeyup = false;
            settings.onclick = false;
            settings.errorClass = 'ace-error';
            settings.validClass = 'ace-success';
        }
    });
    var errorSummaryShown = false;
    var serverSideErrorSummary = $('[data-valmsg-summary="true"]');
    if (serverSideErrorSummary) {
        errorSummaryShown = true;
    }

    function ShowErrors(errorMap, errorList) {
        var numErrors = this.numberOfInvalids();
        document.body.setAttribute('data-validation-errors', numErrors);
        if (numErrors === 0) {
            $(".validation-summary-errors").hide();
            $(".input-validation-error").removeClass("input-validation-error");
            $(".field-validation-error").hide();
        }
        else {
            var validationSummaryMessage = buildErrorSummary(errorList);

            var validationSummary = $(".validation-summary-errors")[0];
            if (validationSummary) {
                validationSummary.setAttribute('role', 'alert');
                validationSummary.innerHTML = validationSummaryMessage;
                if (validationSummary.querySelector('.ace-error-heading')) {
                    validationSummary.querySelector('.ace-error-heading').focus();
                }
            }

            this.defaultShowErrors();
            catchInvalidAriaReferences();
            errorSummaryShown = true;
            clearErrorsOnBlur();
        }
    }

    function catchInvalidAriaReferences() {
        // This is essentially patching a bug in jquery validate where valid fields still get aria-describedby attributes, and they point at nothing
        var fieldsDescribed = $('[aria-describedby*="error"]');
        fieldsDescribed.each(function () {
            var describedByTags = $(this).attr('aria-describedby').split(" ");
            for (var i = (describedByTags.length - 1); i >= 0; i--) {
                if (isSelectorValid(describedByTags[i])) {
                    var description = $('#' + describedByTags[i]);
                    if (description.length == 0) {
                        describedByTags.pop();
                    }
                }
                else {
                    describedByTags.pop();
                }
            }
            var newAttribute = describedByTags.join(" ");
            if (newAttribute.length > 0) {
                $(this).attr('aria-describedby', describedByTags.join(" "));
            }
            else {
                $(this).removeAttr('aria-describedby');
            }
        });
    }

    // replace tickmarks with actual quotes
    $('[data-valmsg-for]').each(function (index) {
        $(this).html($(this).html().replace(' \'', ' &lsquo;'));
        $(this).html($(this).html().replace('\' ', '&rsquo; '));
    });

    // apply invalid styles to visible input when a hidden input is declared invalid
    // add aria-invalid="true" and aria-describedby to link up with error message
    $('.input-validation-error').each(function (index) {
        var linkedField = $('[data-linked-hidden-field="' + this.name + '"]');
        if (linkedField) {
            linkedField.addClass('input-validation-error ace-invalid-input');
            $(linkedField).attr('aria-invalid', 'true');
            $(linkedField).attr('aria-describedby', $(this).attr('name').toLowerCase() + "-valMsg");
        }
        else {
            $(this).attr('aria-invalid', 'true');
            $(this).attr('aria-describedby', $(this).attr('name').toLowerCase() + "-valMsg");
        }
    });

    // focus on first invalid element if error summary isn't applicable to the page, but there are still errors
    if (!errorSummaryShown) {
        var firstFieldWithErrors = $('.input-validation-error:not([hidden]):not([type="hidden"])')[0];
        var manualErrorMessage = $('.validation-summary-msg-manual')[0];
        if (firstFieldWithErrors) {
            $(firstFieldWithErrors).focus();
        }
        if (manualErrorMessage) {
            manualErrorMessage.focus();
        }
    }

});

function buildErrorSummary(errorList) {
    var message = validationSummaryHeadingSingle;
    if (errorList.length > 1) {
        message = validationSummaryHeadingMultiple.replace('{0}', errorList.length);
    }
    var individualErrors = "<ol class='ace-error-list'>";
    for (var x = 0; x < errorList.length; x++) {
        individualErrors += "<li><a href='#" + errorList[x].element.id + "'>" + errorList[x].message + "</a></li>";
        var inputWithError = $('#' + errorList[x].element.id);
        inputWithError.attr('aria-invalid', 'true');
        inputWithError.attr('aria-describedby', errorList[x].element.name.toLowerCase() + "-valMsg");
    }
    individualErrors += "</ol>";

    return "<h2 tabindex='-1' class='ace-error-heading h3-style'>" + message + "</h2>" + individualErrors;
}

function clearErrorsOnBlur() {
    var inputsWithErrors = $("[aria-invalid='true']");
    inputsWithErrors.each(function () {
        var thisInput = $(this);
        thisInput.on('blur', function () {
            thisInput.attr('aria-invalid', '');
            thisInput.removeClass('input-validation-error');
        });
    });
}

function isSelectorValid(selector) {
    if (typeof (selector) !== 'string') {
        return false;
    }
    try {
        var $element = $(selector);
    } catch (error) {
        return false;
    }
    return true;
}