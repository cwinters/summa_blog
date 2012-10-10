var Page = {
    memories  : [],
    templates : {}
};

function generateCheckbox( memory ) {
    return Page.templates.checkbox({
        memory : memory,
        year   : new Date( memory.date ).getFullYear()
    });
}

function isBlank( text ) {
    return !!(text === null || text === undefined || text === '' || text.match( /^\s+$/ ));
}

$(document).ready( function() {
    var checkboxTemplateSource = $( '#tmpl_checkbox' ).html();
    Page.templates.checkbox = Handlebars.compile( checkboxTemplateSource );

    $( '#has_axe_yes' ).click( function() {
        $( '#axe_extras' ).show();
    });
    $( '#has_axe_no' ).click( function() {
        $( '#axe_extras' ).hide();
    });
    $( '#person_age' ).change( function() {
        var ageId = $(this).val();
        console.log( "Age changed, fetching memories associated with age ID: " + ageId );
        if ( ! ageId || ageId <= 1 ) {
            $( '#person_age_memories' ).remove();
            return;
        }
        var memoriesPath = 'memories_' + ageId + '.json';
        console.log( "Loading memories from: " + memoriesPath );
        $.getJSON( memoriesPath, function( memories ) {
            // stash them away for later...
            Page.memories = memories;

            // if it exists, delete, then re-add
            $( '#person_age_memories' ).remove();
            $( '#person_age' ).after( '<div class="indent" id="person_age_memories"></div>' );
            _.each( memories, function( memory ) {
                $( '#person_age_memories' ).append( generateCheckbox( memory ) );
            });
        });
    });;
    $( '#complex_form' ).submit( function() {
        var errors = [];
        var idToName = [
            { id : 'person_name', name : 'Person name' },
            { id : 'person_age',  name : 'Age' },
            { id : 'physician',   name : 'Doctor' }
        ];
        _.each( idToName, function( pair ) {
            var selector = '#' + pair.id;
            var fieldValue = $( selector ).val();
            console.log( "onSubmit: " + selector + " => " + fieldValue );
            if ( isBlank( fieldValue ) ) {
                errors.push( pair.name + ' is required.' );
            }
        });
        var ageValue = $( '#person_age' ).val();
        if ( ageValue == 1 ) {
            errors.push( "Age is much too young!" );
        }
                                     
        var hasErrors = errors.length > 0;
        $( '#errors' ).empty();
        if ( hasErrors ) {
            var errorList = '<ul>' + _.map( errors, function( error ) {
                return '<li>' + error + '</li>';
            }).join( "\n" ) + '</ul>';
            $( '#errors' ).html( errorList ).show();
        }
        return ! hasErrors;
    });
    console.log( "BROWSER: done executing onReady handler" );
});
