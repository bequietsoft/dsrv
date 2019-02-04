var jsondb = require( 'node-json-db' );
var db = new jsondb( "db", true, true );

//var show_db_log = true;

module.exports = function() {

	this.show_db_log = true;

	this.db_get_items = function( path ) {
		try { return  db.getData( path ); } catch (error) {}
		return undefined;
	}

	this.db_get_item_by_id = function( path, id ) {
		let items = db_get_items( path );
		let result = undefined;
		items.forEach( item => { if( item.id == id ) result = item; } );
		return result;
	}

	this.db_get_items_by_key = function( path, key, value = undefined ) {
		let items = db_get_items( path ).
		filter( function( item ) { 
			if( item.hasOwnProperty( key ) )
				if( value == undefined ) 
					return item;
				else 
					if( item[ key ] == value ) return item;
			//return;
		});
		return items;
	}

	this.db_clear = function( path ) {
		let items = db_get_items( path );
		if( Array.isArray( items ) ) 
			for( let i = 0; i < items.length; i++ ) db.delete( path + '[-1]' );
		else 
			db.delete( path );
	}
	
	this.db_add_item = function( path, data ) {
		let item = db_get_item_by_id( path, data.id );
		if( item != undefined ) { 
			
			if( item.id != undefined && data.id != undefined )
				if( item.id == data.id ) {
					if( show_db_log ) 
						log( 'db_add_item: item with id ' + data.id + ' already exist' );
					return false; 
				}

			if( item.name != undefined && data.name != undefined )
				if( item.name == data.name ) {
					if( show_db_log ) 
						log( 'db_add_item: item with name ' + data.name + ' already exist' );
					return false; 
				}
		}
		db.push( path + '[]', data );
		return true; 
	}
	
	this.db_del_item_by_id = function( path, id ) {
		let items = db_get_items( path );
		for( let i = 0; i < items.length; i++ )
			if( items[i].id == id ) {
				db.delete( path + '[' + i + ']' );
				i--;
			}
		return false;
	}

	this.db_del_item_by_name = function( path, name ) {
		let items = db_get_items( path );
		for( let i = 0; i < items.length; i++ )
			if( items[i].name == name ) {
				db.delete( path + '[' + i + ']' );
				i--;
			}
		return false;
	}

	this.db_rewrite = function( path, id, data ) {
		db_del_item_by_id( path, id );
		db_add_item( path, data );
	}

	this.db_update_path = function( path, value, clear ) {
		if( db_get_items( path ) == undefined ) 
			db.push( path, value );
		else 
			if( clear ) db_clear( path );
	}
}