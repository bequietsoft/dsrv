var jsondb = require( 'node-json-db' );
var db = new jsondb( "db", true, true );

// #region db

module.exports = function() {

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

	this.db_clear = function( path ) {
		let items = db_get_items( path );
		if( Array.isArray( items ) ) 
			for( let i = 0; i < items.length; i++ ) db.delete( path + '[-1]' );
		else 
			db.delete( path );
	}
	
	this.db_add_item = function( path, data ) {
		let item = db_get_item_by_id( path, data.id );
		//log( '   find exist item = ' + js(item) );
		if( item != undefined ) { 
			
			if( item.id != undefined && data.id != undefined )
				if( item.id == data.id ) {
					log( 'item with id ' + data.id + ' already exist' );
					return false; 
				}

			if( item.name != undefined && data.name != undefined )
				if( item.name == data.name ) {
					log( 'item with name ' + data.name + ' already exist' );
					return false; 
				}
		}
		db.push( path + '[]', data );
		//log('ADD ' + now() );
		return true; 
	}
	
	this.db_del_item_by_id = function( path, id ) {
		let items = db_get_items( path );
		for( let i = 0; i < items.length; i++ )
			if( items[i].id == id ) {
				db.delete( path + '[' + i + ']' );
				i--;
				//return true;
			}
		return false;
	}

	this.db_del_item_by_name = function( path, name ) {
		let items = db_get_items( path );
		//log( items, false );
		for( let i = 0; i < items.length; i++ )
			if( items[i].name == name ) {
				//log('del ' + js(items[i]));
				db.delete( path + '[' + i + ']' );
				i--;
				//return true;
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