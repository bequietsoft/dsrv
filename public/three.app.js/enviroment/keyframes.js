class Keyframes {

	static init() {
		Keyframes.items = [];
		Keyframes.debug_info = false;
	}

	static add( data ) {	

		log(data.root);

		if( data.items.length == 0 ) return;
		
		let values = [];
		for( let i = 0; i < data.items.length; i++ ) 
			values.push( eval( data.root + '.' + data.items[i] ) );

		let keyframe = { id: data.id, items: data.items, values: values, root: data.root };
		Keyframes.items.push( keyframe );
	}

	static print() {
		if( Keyframes.items.length == 0 ) { log('Empty keyframes'); return; }
		for( let i = 0; i < Keyframes.items.length; i++ ) {
			let keyframe = Keyframes.items[i];
			let _keyframe = keyframe.id + ': ';
			for( let j = 0; j < keyframe.items.length; j++ ) {
				_keyframe += keyframe.items[j] + '=' + _keyframe.values[j];
				if( j < keyframe.items.length - 1 ) _keyframe += ', ';
			}
			log( _keyframe );
		}
	}

	static clone( i ) {
		let source_keyframe = Keyframes.items[ i ];
		let clone_id = source_keyframe.id;
		let clone_items = source_keyframe.items.slice();
		let clone_values = source_keyframe.values.slice();
		let clone_root = source_keyframe.root;
		return { id: clone_id, items: clone_items, values: clone_values, root: clone_root };
	}

	static play ( data ) {

		let keyframe_index = data.sequence[ data.index ];
		let keyframe = Keyframes.clone( keyframe_index );
		if( keyframe == undefined ) { 
			if( Keyframes.debug_info ) log('Wrong keyframe'); 
			return; 
		}

		data.id = RK(8) + Date.now();
		if( Keyframes.debug_info ) log('add ' + data.id );

		Actions.add({

			id: 		data.id,
			keyframe: 	keyframe,
			frame:		0,

			sequence: 	data.sequence,
			temps: 		data.temps,		
			index: 		data.index,
			root: 		data.root,

			update: function( data ) {

				let frames_left = data.temps[ data.index ] - data.frame;
				if( frames_left > 0 ) {

					let skip_frame = true;
					
					data.deltas = [];
					for( let i = 0; i < keyframe.items.length; i++ ) {
						let root = data.root || keyframe.root;
						let d = keyframe.values[i] - eval( root + '.' + keyframe.items[i] );
						if( Math.abs( d ) > 0.001 ) skip_frame = false;
						data.deltas.push( d / frames_left );
					}

					if( skip_frame ) {
						if( Keyframes.debug_info ) log( '\t skip frame ' + data.index );
						data.frame = data.temps[ data.index ];
						return;
					}

					if( Keyframes.debug_info ) log( '\t ' + data.index + ' - ' + data.frame + '   ' + js( data.deltas ) );

					for( let i = 0; i < data.keyframe.items.length; i++ ) {
						let root = data.root || keyframe.root;
						eval( root + '.' + data.keyframe.items[i] + ' += ' +  data.deltas[ i ] );
					}

					data.frame++;

				} else {
					if( Keyframes.debug_info ) log('del ' + data.id );
					Actions.del( data.id );
					if( data.index < data.sequence.length - 1 ) {
						data.index++;
						data.frame = 0;
						Keyframes.play ( data );
					} 
				}
				
				

				{
				// // update deltas
				// if( data.frames_count > 0 ) {
				// 	log('update deltas ' + js(data) );
				// 	data.deltas = [];
				// 	for( let i = 0; i < keyframe.items.length; i++ ) {
				// 		let root = data.root || keyframe.root;
				// 		let d = eval( keyframe.values[i] + ' - ' +  root + '.' + keyframe.items[i] );
				// 		data.deltas.push( d / data.frames_count );
				// 	}
				// }
				
				// // check skip frame
				// let skip_keyframe = true;
				// for( let i = 0; i < data.keyframe.items.length; i++ ) 
				// 	if( Math.abs( data.deltas[i] ) > 0.001) { 
				// 		skip_keyframe = false;
				// 		break;
				// 	}

				// // stop action
				// if( data.frames_count == 0 || skip_keyframe ) {
				// 	Actions.del( data.id );
				// 	if( data.frames_count < data.sequence.length - 1 ) {
				// 		data.frames_count++;
				// 		Keyframes.play ( data.sequence, data.frames );
				// 	} else {
				// 		data.frames_count = 0;
				// 		return;
				// 	}
				// } else
				// // continue action
				// 	for( let i = 0; i < data.keyframe.items.length; i++ ) {
				// 		let root = data.root || keyframe.root;
				// 		eval( root + '.' + data.keyframe.items[i] + ' += ' +  data.deltas[i] );
				// 	}

				//data.frames_index--;
				}
			}
		});
	}
}
