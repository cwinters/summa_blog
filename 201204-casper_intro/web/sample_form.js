function generateCheckbox( memory ) {
    var checkboxTemplate = '<input type="checkbox" name="memory" value="%i" id="memory_%i" /> '
                           + '<label for="memory_%i">%n (%d)</label> <br />';
    var date = new Date( memory.date );
    return checkboxTemplate.replace( /%i/g, memory.id )
               .replace( /%n/g, memory.name )
               .replace( /%d/g, date.getFullYear() );
}

function isBlank( text ) {
    return !!(text === null || text === undefined || text === '' || text.match( /^\s+$/ ));
}

$(document).ready( function() {
    $( '#has_axe_yes' ).click( function() {
        $( '#axe_extras' ).show();
    });
    $( '#has_axe_no' ).click( function() {
        $( '#axe_extras' ).hide();
    });
    $( '#person_age' ).change( function() {
        var ageId = $(this).val();
        if ( ! ageId ) return;
        var memoriesPath = 'memories_' + ageId + '.json';
        console.log( "Loading memories from: " + memoriesPath );
        $.getJSON( memoriesPath, function( memories ) {
            $( '#person_age_memories' ).empty();
            _.each( memories, function( memory ) {
                $( '#person_age_memories' ).append( generateCheckbox( memory ) );
            });
            $( '#person_age_memories' ).show();
        });
    });;
    $( '#sample_form' ).submit( function() {
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
});
