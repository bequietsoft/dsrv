var default_cincture_data = {
	
	name: 'default_cincture_name',

	offsets: [
		0.00,   0.00,	0.00,
		0.00,   0.60,	0.00
	],

	rotates: [
		0.00,	0.00,	0.00,
		0.00,	0.00,	0.00
	],

	nodes: [	
		0.40,	0.40,	0.40,	0.40,
		0.40,	0.40,	0.40,	0.40
	],

	angles: undefined, 	// must be array or undefined. if not undefined, nodes and angles array must be some length.
	
	cinc_angle: 360, 	// used if angles array is undefined
	start_angle: 0,

	symmetry: false,
	mirror: 1,
	scale: 1,
	smooth: { normals: 0, vertices: 0 },
	subnodes: 0,
	subcincs: 0,
	cap_curve: { begin: 0, end: 0 },
	cap: { begin: true, end: true },
	closed: true,
	material: mat( 'lambert', rgb( 200, 200, 200 ), true ),
	shadows: { cast: true, recive: true },
	helpers: 0,
	vertices_epsilon: 0.001,
	cloth: false,
	clamp_cinc: { begin: 0, end: 1000000 },
	skeleton: undefined,

	uv: { x: 0, y: 0, width: 1, height: 1 }
};

class Cincture {

	constructor( data = default_cincture_data ) {

		this.points = [];
		this.data = data;
		this.data.nodes_markers = [];

		this.geometry = new THREE.Geometry();
		this.geometry.faceVertexUvs[ 0 ] = [];

		this.check_data();
		this.calc_counters();
		this.sub_divisions();
		//this.smooth_vertices();
		this.cals_angles();
		this.build_geometry();
		this.smooth_normals();
		this.build_mesh();
		this.build_skeleton();
		this.add_helpers();

		this.points = undefined;
		delete this.points;
    }

	check_data() {
		this.data.smooth.normals = clamp( this.data.smooth.normals, 0, 1 );
		this.data.smooth.vertices = clamp( this.data.smooth.vertices, 0, 1 );
		if ( this.data.angles != undefined && this.data.nodes.length != this.data.angles.length ) 
			log( 'Wrong parameters: nodes and angles array must be some length.' );
	}

	calc_counters() {
		this.cincs_count = this.data.offsets.length / 3;
		this.nodes_count = this.data.nodes.length / this.cincs_count;
	}

	sub_divisions() {
		
		if ( this.data.edges_mesh_build ) return;

		let _nodes_flags = [];
		for( let ci = 0; ci < this.cincs_count; ci++ )
			for( let ni = 0; ni < this.nodes_count; ni++ )
				_nodes_flags.push( 1 );
		this.data.nodes_flags = _nodes_flags;

		// nodes sub divisions
		if ( this.data.subnodes > 0 ) {
			for ( let si=0; si < this.data.subnodes; si++ ) {

				let nodes = this.data.nodes;
				let angles = this.data.angles;						
				let _nodes = [];
				let _angles = [];
				let _nodes_flags = [];

				for( let ci = 0; ci < this.cincs_count; ci++ ) {
					
					let i = ci * this.nodes_count;

					for( let ni = 0; ni < this.nodes_count; ni++ ) {
						
						let ni0 = (ni - 1) % this.nodes_count;
						let ni1 = (ni + 0) % this.nodes_count;
						let ni2 = (ni + 1) % this.nodes_count;
						let ni3 = (ni + 2) % this.nodes_count;

						if ( ni0 < 0 ) ni0 = this.nodes_count + ni0;
						
						let node0 = nodes[ i + ni0 ];
						let node1 = nodes[ i + ni1 ];
						let node2 = nodes[ i + ni2 ];
						let node3 = nodes[ i + ni3 ];

						let _node = this.catmullrom( 0.5, node0, node1, node2, node3 );						
						_nodes.push( node1, _node );
						_nodes_flags.push( this.data.nodes_flags[ i + ni1 ], 0 );

						if ( angles != undefined ) {
							let _angle = angles[ i + ni1 ] / 2;
							_angles.push( _angle, _angle );
						}
					}
				}

				this.data.nodes = _nodes;
				this.data.nodes_flags = _nodes_flags;
				if ( angles != undefined ) this.data.angles = _angles;

				this.calc_counters();
			}
		} 

		// cincs sub divisions
		if ( this.data.subcincs > 0 ) {
			for ( let si = 0; si < this.data.subcincs; si++ ) {
				
				let rotates = this.data.rotates;	
				let offsets = this.data.offsets;	
				let nodes = this.data.nodes;
				let nodes_flags = this.data.nodes_flags;	
				let angles = this.data.angles;	
				let _rotates = [];
				let _offsets = [];
				let _nodes = [];
				let _nodes_flags = [];
				let _angles = [];

				for( let ci = 0; ci < this.cincs_count; ci++ ) {
					
					let i = ci * this.nodes_count;
					let j = ci * 3;

					// copy cinc:

					_rotates.push ( rotates[ j + 0 ] / 2, rotates[ j + 1 ] / 2,	rotates[ j + 2 ] / 2 );
					_offsets.push ( offsets[ j + 0 ] / 2, offsets[ j + 1 ] / 2, offsets[ j + 2 ] / 2 );

					for( let ni = 0; ni < this.nodes_count; ni++ ) {
						_nodes.push ( nodes[ i + ni ] );
						_nodes_flags.push ( nodes_flags[ i + ni ] );
						if ( angles != undefined ) _angles.push ( angles[ i + ni ] );
					}
					
					// add new cinc:

					if ( ci < this.cincs_count - 1 ) {

						_rotates.push ( rotates[ j + 3 ] / 2, rotates[ j + 4 ] / 2,	rotates[ j + 5 ] / 2 );
						_offsets.push ( offsets[ j + 3 ] / 2, offsets[ j + 4 ] / 2, offsets[ j + 5 ] / 2 );

						for( let ni = 0; ni < this.nodes_count; ni++ ) {
							
							let ni0 = ni - 1 * this.nodes_count;
							let ni1 = ni + 0 * this.nodes_count;
							let ni2 = ni + 1 * this.nodes_count;
							let ni3 = ni + 2 * this.nodes_count;
							
							let node0 = nodes[ i + ni0 ];
							let node1 = nodes[ i + ni1 ];
							let node2 = nodes[ i + ni2 ];
							let node3 = nodes[ i + ni3 ];

							if ( ci <= 0 ) node0 = - this.data.cap_curve.begin * node2;
							if ( ci >= this.cincs_count - 2 ) node3 = - this.data.cap_curve.end * node1;
							
							if ( node1 == node2 && node2 == node3 ) node0 = node1;
							if ( node0 == node1 && node1 == node2 ) node3 = node2;

							let _node = this.catmullrom( 0.5, node0, node1, node2, node3 );
							_nodes.push ( _node );
							_nodes_flags.push ( 0 );

							if ( angles != undefined ) {
								let angle0 = angles[ i + ni0 ];
								let angle1 = angles[ i + ni1 ];
								let angle2 = angles[ i + ni2 ];
								let angle3 = angles[ i + ni3 ];
								if ( ci <= 0 ) angle0 = angle1;
								if ( ci >= this.cincs_count - 2 ) angle3 = angle2;
								if ( angle1 == angle2 && angle2 == angle3 ) angle0 = angle1;
								if ( angle0 == angle1 && angle1 == angle2 ) angle3 = angle2;
								let _angle = this.catmullrom( 0.5, angle0, angle1, angle2, angle3 );
								
								_angles.push ( _angle );
							}
						}
						
					}
				}

				this.data.rotates = _rotates;
				this.data.offsets = _offsets;
				this.data.nodes = _nodes;
				this.data.nodes_flags = _nodes_flags;
				if ( angles != undefined ) this.data.angles = _angles;

				this.calc_counters();
			}
		}
	}

	cals_angles() {

		this.delta_angle = d2r( this.data.cinc_angle / this.nodes_count );
		
		if ( this.data.cinc_angle != 360 ) 
			this.delta_angle = d2r( this.data.cinc_angle / (this.nodes_count - 1) );
	}

	get_real_node( i ) { 

		// reverse_nodes for build symmetry cincture

		if ( !this.data.reverse_nodes ) return this.data.nodes[ i ] * this.data.scale;
		
		let ci = Math.floor( i / this.nodes_count );
		let ni = i - ci * this.nodes_count;
		let ri = ci * this.nodes_count + ( this.nodes_count - 1 - ni );
		
		//return ri; 
		return this.data.nodes[ ri ] * this.data.scale; 
	}

	// get_real_node_value( i ) {
	// 	return this.data.nodes[ this.get_real_node_index( i ) ] * this.data.scale; 
	// }

	get_real_angle( i ) { // 

		if ( this.data.angles == undefined ) return this.delta_angle;

		if ( !this.data.reverse_nodes ) {
			return d2r( this.data.angles [ i ] );
		}

		let ci = Math.floor( i / this.nodes_count );
		let ni = i - ci * this.nodes_count;
		
		let ri = ci * this.nodes_count + ( this.nodes_count - 1 - ni );
		//log( '4 ' + ci + ':' + ni + ' >> ri=' + ri);

		return d2r( this.data.angles [ ri ] );
	}

	check_clamp_cinc ( ci ) {

		if ( this.data.cloth == false ) return true;

		if ( ci < this.data.clamp_cinc.begin || ci > this.data.clamp_cinc.end - 1 ) 
			return false;

		return true;
	}

    build_geometry() {

		let points = this.points;
		let mirror = this.data.mirror;

		// collect temp points
		let total_rotation = V( 0, 0, 0 );
		let total_position = V( 0, 0, 0 );
		let fni = 0; 	// first node index in cincture ci
		let fti = 0; 	// first coord/angle for cincture ci
        for ( let ci = 0; ci < this.cincs_count; ci++ ) {

			let offset = V( this.data.offsets[ fti + 0 ], this.data.offsets[ fti + 1 ], mirror * this.data.offsets[ fti + 2 ] );
			let scaled_offset = MV( offset, this.data.scale );
			total_rotation.add( V( mirror * this.data.rotates[ fti + 0 ], mirror * this.data.rotates[ fti + 1 ], this.data.rotates[ fti + 2 ] ) );
			total_position.add( RV ( scaled_offset, total_rotation) );

			let angle0 = mirror * d2r( this.data.start_angle );
			let node0;
			let angle1;
			let node1;
				
            for ( let ni = 0; ni < this.nodes_count; ni++ ) {
				
				node0 = this.get_real_node( fni + ni );
				
                if ( ni != this.nodes_count - 1 )
                    node1 = this.get_real_node( fni + ni + 1 );
                else 
					node1 = this.get_real_node( fni );

				let angle1_delta = mirror * this.get_real_angle( fni + ni );
				angle1 = angle0 + angle1_delta;

				if ( ni == this.nodes_count - 1 ) 
					if ( this.data.cinc_angle < 360 )
						angle1 = mirror * d2r( this.data.start_angle );

				let cos0 = Math.cos( angle0 );
				let sin0 = Math.sin( angle0 );
				let cos1 = Math.cos( angle1 );
				let sin1 = Math.sin( angle1 );

				let v0 = new THREE.Vector3( 0, 0, 0 );
				let v1 = new THREE.Vector3( node0 * cos0, 0, node0 * sin0 );
				let v2 = new THREE.Vector3( node1 * cos1, 0, node1 * sin1 );
				
				if ( mirror == -1 ) {
					v1 = new THREE.Vector3( node1 * cos1, 0, node1 * sin1 );
					v2 = new THREE.Vector3( node0 * cos0, 0, node0 * sin0 );
				}

				v0 = RV( v0, total_rotation );
				v1 = RV( v1, total_rotation );
				v2 = RV( v2, total_rotation );

				this.data.nodes_markers.push( new THREE.Vector3( v1.x, v1.y, v1.z ) );

				v0.add( total_position );
				v1.add( total_position );
				v2.add( total_position );

				// for symmetry faces
				let _v0 = V( v0.x, v0.y, -v0.z );
				let _v1 = V( v1.x, v1.y, -v1.z );
				let _v2 = V( v2.x, v2.y, -v2.z );

				// Add uv coords
				{ 
					let w = this.data.uv.width;
					let h = this.data.uv.height;

					let sh = h / ( this.cincs_count + 1 );	// vertical step
					let sw = w / this.nodes_count;			// horizontal step
					let sp = new THREE.Vector2 ( 			// start point (down-left)
						this.data.uv.x + w,
						this.data.uv.y
					);
					
					if ( this.data.symmetry ) {
						sw = w / ( this.nodes_count - 1 );
						sw = sw / 2;
					}
					
					v0.uv = THREE.Vector2( 0, 0 );
					v1.uv = THREE.Vector2( 0, 0 );
					v2.uv = THREE.Vector2( 0, 0 );
					
					_v0.uv = THREE.Vector2( 0, 0 );
					_v1.uv = THREE.Vector2( 0, 0 );
					_v2.uv = THREE.Vector2( 0, 0 );

					if ( ci == 0 ) {
						v0.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 0) );
						v1.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 1) );
						v2.uv = this.norm_uv ( sp.x - sw * (ni + 1), sp.y + sh * (ci + 1) );
						v0.uv.x -= sw / 2;
						
						_v0.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 0) );
						_v1.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 1) );
						_v2.uv = this.norm_uv ( sp.x - w + sw * (ni + 1), sp.y + sh * (ci + 1) );
						_v0.uv.x += sw / 2;
					}

					if ( ci > 0 &&  ci < (this.cincs_count - 1) ) {
						v0.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 0) );
						v1.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 1) );
						v2.uv = this.norm_uv ( sp.x - sw * (ni + 1), sp.y + sh * (ci + 1) );
						v0.uv.x -= sw / 2;
						
						_v0.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 0) );
						_v1.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 1) );
						_v2.uv = this.norm_uv ( sp.x - w + sw * (ni + 1), sp.y + sh * (ci + 1) );
						_v0.uv.x += sw / 2;
					}

					if ( ci == ( this.cincs_count - 1) ) {
						v0.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 2) );
						v1.uv = this.norm_uv ( sp.x - sw * (ni + 0), sp.y + sh * (ci + 1) );
						v2.uv = this.norm_uv ( sp.x - sw * (ni + 1), sp.y + sh * (ci + 1) );
						v0.uv.x -= sw / 2;

						_v0.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 2) );
						_v1.uv = this.norm_uv ( sp.x - w + sw * (ni + 0), sp.y + sh * (ci + 1) );
						_v2.uv = this.norm_uv ( sp.x - w + sw * (ni + 1), sp.y + sh * (ci + 1) );
						_v0.uv.x += sw / 2;
					}
					
				}
				
				points.push( v0, v1, v2 ); 		// points for up face
				points.push( v0, v1, v2 ); 		// points for down face
				points.push( _v0, _v1, _v2 ); 	// points for up symmetry face
				points.push( _v0, _v1, _v2 ); 	// points for down symmetry face

				angle0 += angle1_delta;
			}

			fni += this.nodes_count; 	
			fti += 3;	
        }

		// create faces
		var len = this.nodes_count * 12;
		var fpi = 0;
        for ( var ci = 0; ci < this.cincs_count; ci++ ) {

			for ( var ni = 0; ni < this.nodes_count; ni++ ) {
				if ( this.data.closed || ( !this.data.closed && ni < this.nodes_count-1 ) )
					if ( this.data.symmetry == false || ( this.data.symmetry == true && ni < this.nodes_count - 1 )) {
						
						// 0, 1, 2 - up face indexes
						// 3, 4, 5 - down face indeces

						// start cap faces
						if ( this.data.cap.begin != 0 && ci == 0 && this.check_clamp_cinc( ci ) ) 
							this.add_face( [ fpi + 0, fpi + 1, fpi + 2 ], [ ci, ci, ci ] );

						// down face 
						if ( ci > 0 && this.check_clamp_cinc( ci - 1 ) ) {
							var l0 = LV( DV( points[ fpi + 4 - len ], points[ fpi + 2 ] ) );
							var l1 = LV( DV( points[ fpi + 5 - len ], points[ fpi + 1 ] ) );
							if ( l0 >  l1 ) this.add_face( [ fpi + 4 - len, fpi + 1, fpi + 2], [ ci - 1, ci, ci ] );
							if ( l1 >= l0 ) this.add_face( [ fpi + 5 - len, fpi + 1, fpi + 2], [ ci - 1, ci, ci ] );
						}

						// up face
						if ( ci < this.cincs_count - 1 && this.check_clamp_cinc( ci ) ) {
							var l0 = LV ( DV( points[ fpi + 1 + len ], points[ fpi + 2 ] ) );
							var l1 = LV ( DV( points[ fpi + 2 + len ], points[ fpi + 1 ] ) );
							if ( l0 >= l1 ) this.add_face( [ fpi + 1, fpi + 1 + len, fpi + 2 ], [ ci, ci + 1, ci] );
							if ( l1 >  l0 ) this.add_face( [ fpi + 1, fpi + 2 + len, fpi + 2 ], [ ci, ci + 1, ci ] );
						}
						
						// end cap faces
						if ( this.data.cap.end != 0 && ci == this.cincs_count - 1 && this.check_clamp_cinc( ci ) ) 
							this.add_face( [ fpi + 3, fpi + 5, fpi + 4 ], [ ci, ci, ci ] );


						// add symmetry faces
						if ( this.data.symmetry ) {
							
							// 6, 7, 8 - up face indexes
							// 9, 10, 11 - down face indeces
							
							// start cap faces
							if ( this.data.cap.begin != 0 && ci == 0 && this.check_clamp_cinc( ci ) ) 
								this.add_face( [ fpi + 6, fpi + 8, fpi + 7 ], [ ci, ci, ci ] );

							// down face 
							if ( ci > 0 && this.check_clamp_cinc( ci - 1 ) ) {
								var l0 = LV ( DV( points[ fpi + 10 - len ], points[ fpi + 8 ] ) );
								var l1 = LV ( DV( points[ fpi + 11 - len ], points[ fpi + 7 ] ) );
								if ( l0 >  l1 ) this.add_face( [ fpi + 8, fpi + 7, fpi + 10 - len ], [ ci, ci, ci - 1 ] );
								if ( l1 >= l0 ) this.add_face( [ fpi + 8, fpi + 7, fpi + 11 - len ], [ ci, ci, ci - 1 ] );
							}

							// up face
							if ( ci < this.cincs_count - 1 && this.check_clamp_cinc( ci ) ) {
								var l0 = LV ( DV( points[ fpi + 7 + len ], points[ fpi + 8 ] ) );
								var l1 = LV ( DV( points[ fpi + 8 + len ], points[ fpi + 7 ] ) );
								if ( l0 >= l1 ) this.add_face( [ fpi + 8, fpi + 7 + len, fpi + 7 ], [ ci, ci + 1, ci ] );
								if ( l1 >  l0 ) this.add_face( [ fpi + 8, fpi + 8 + len, fpi + 7 ], [ ci, ci + 1, ci ] );
							}
							
							// end cap faces
							if ( this.data.cap.end != 0 && ci == this.cincs_count - 1 && this.check_clamp_cinc( ci ) ) 
								this.add_face( [ fpi + 9, fpi + 10, fpi + 11 ], [ ci, ci, ci ] );
						
						}
					}

				fpi += 12;
			}

        }
		
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
	}
	
	norm_uv( x, y ) {
		// if (x < 0) while ( x < 0 ) { x += 1; }
		// if (y < 0) y = 0; //while ( y < 0 ) { y += 1; }
		// if (x > 1) while ( x > 1 ) { x -= 1; }
		// if (y > 1) y = 1; //while ( y > 1 ) { y -= 1; }
		return new THREE.Vector2 ( x, y );
	}

	build_mesh() {
		this.mesh = new THREE.SkinnedMesh( this.geometry, this.data.material );
		this.mesh.castShadow = this.data.shadows.cast;
		this.mesh.receiveShadow = this.data.shadows.recive;
	}

	build_skeleton() {

		// bind external skeleton
		if ( this.data.skeleton != undefined)
		{ 
			this.mesh.bind( this.data.skeleton );
			return;
		}

		// create auto skeleton

		this.data.bones = [];

		var total_rotation = V( 0, 0, 0 );
		// var total_position = V( 0, 0, 0 );
		var rotation;
		var position;

		var fni = 0; // first node index in cincture ci
		var fti = 0; // first coord/angle for cincture ci
		for( let ci = 0; ci < this.cincs_count; ci++ ) {
			
			rotation = V( this.data.rotates[ fti + 0 ], this.data.rotates[ fti + 1 ], this.data.rotates[ fti + 2 ] );
			total_rotation.add( rotation );
			
			position = RV( MV( V( 
				this.data.offsets[ fti + 0 ], 
				this.data.offsets[ fti + 1 ], 
				this.data.offsets[ fti + 2 ] ), this.data.scale ), total_rotation);
			
			var bone = new THREE.Bone();
				bone.position.set( position.x, position.y, this.data.mirror * position.z );


			this.data.bones.push( bone );
			if( ci > 0 ) this.data.bones[ ci - 1 ].add( this.data.bones[ ci ] );

			// add markers of real nodes:
			for ( let ni = 0; ni < this.nodes_count; ni++ ) {
				
				let nmv = V0;
				let nmf = 1;
				let color = rgb(200, 0, 0);
				
				if( this.data.nodes_markers != undefined && this.data.nodes_flags != undefined ) {
					nmv = this.data.nodes_markers[ fni + ni ];
					nmf = this.data.nodes_flags[ fni + ni ];
					color = rgb( 200, 200, 200 );
				}
				//if( nmv != undefined && nmf != undefined ) {
					if( nmf == 1 ) bone.add( marker( nmv, color, 0.004, 8, true ) );
					//if( nmf == 0 ) bone.add( marker( nmv, rgb(0, 0, 0), 0.002, 2, true ) );
				//}
			}

			fni += this.nodes_count; 
			fti += 3;
		}

		this.mesh.add( this.data.bones[ 0 ] );
		this.data.skeleton = new THREE.Skeleton( this.data.bones );
		this.mesh.bind( this.data.skeleton );
	}

	add_helpers() {

		if ( this.data.helpers == 0 ) return;

		this.edges_helper = this.mesh.clone();
		this.edges_helper.material = mat('wire', rgb( 255, 255, 200 ));
		this.edges_helper.castShadow = false;
		this.edges_helper.receiveShadow = false;
		this.edges_helper.skeleton = undefined;
		

		this.vertex_normals_helper = new THREE.VertexNormalsHelper( this.edges_helper, this.data.helpers, 0x00ff00, 0.01 );
		this.mesh.add( this.vertex_normals_helper );

		this.face_normals_helper = new THREE.FaceNormalsHelper( this.edges_helper, this.data.helpers, 0xff0000, 0.01 );
		this.mesh.add( this.face_normals_helper );

		this.skeleton_helper = new THREE.SkeletonHelper( this.mesh );
		App.world.scene.add( this.skeleton_helper );

		this.edges_helper.bind( this.data.skeleton );
		this.mesh.add( this.edges_helper );
	}

	// utils :

	make_uv_map( ) {
		
		let uv = this.geometry.faceVertexUvs[ 0 ];
		if ( uv == undefined ) return;

		let texture = this.data.material.map;
		let w = texture.image.width;
		let h = texture.image.height;

		let canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;

		let context = canvas.getContext("2d");
			context.drawImage( texture.image, 0, 0 );
			context.strokeStyle = "black";
			context.lineWidth = 1;

		
		for ( let i = 0; i < uv.length; i++)
		{
			let fuv = uv[i];  
			
			context.beginPath();
			context.moveTo( w * fuv[0].x, h - h * fuv[0].y );
			context.lineTo( w * fuv[1].x, h - h * fuv[1].y );
			context.lineTo( w * fuv[2].x, h - h * fuv[2].y );
			context.closePath();
			context.stroke();
		}

		// download texture to local storage
		var link = document.createElement('a');
		link.download = "map.png";
		link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");;
		link.click();

		// update texture on mesh
		texture.image.src = canvas.toDataURL();
		texture.anisotropy = 4;
		texture.needsUpdate = true;
	}

	catmullrom( t, p0, p1, p2, p3 ) {
		var v0 = ( p2 - p0 ) * 0.5;
		var v1 = ( p3 - p1 ) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;
	}

	mark_point( p, color ) {
		let a = sphere( 0.02, p, V0, mat('phong', color ) );
		this.marks.push ( a );
	}

	mark_face( fi ) {
		log('face ' + fi + ' marked');
		let geometry = this.geometry;
		let face = geometry.faces[ fi ];
		let a = sphere( 0.02, geometry.vertices[ face.a ], V0, mat('phong', rgb(200, 0, 0) ) );
		let b = sphere( 0.02, geometry.vertices[ face.b ], V0, mat('phong', rgb(0, 200, 0) ) );
		let c = sphere( 0.02, geometry.vertices[ face.c ], V0, mat('phong', rgb(0, 0, 200) ) );
		this.mesh.add( a );
		this.mesh.add( b );
		this.mesh.add( c );
	}

	add_face( vertex_index = [ 0, 0, 0 ], skin_index = [ 0, 0, 0 ] ) {
		
		let v0 = this.points [ vertex_index[ 0 ] ];
		let v1 = this.points [ vertex_index[ 1 ] ];
		let v2 = this.points [ vertex_index[ 2 ] ];

		let vl = this.geometry.vertices.length;
		
		this.geometry.vertices.push( v0 );
		this.geometry.vertices.push( v1 );
		this.geometry.vertices.push( v2 );
		
		this.geometry.faces.push( new THREE.Face3( vl + 0, vl + 1, vl + 2 ) );
		this.geometry.faceVertexUvs[ 0 ].push( [ v0.uv, v1.uv, v2.uv ] );

		this.geometry.skinIndices.push( new THREE.Vector4( skin_index[ 0 ], 0, 0, 0) );
		this.geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0) );
		this.geometry.skinIndices.push( new THREE.Vector4( skin_index[ 1 ], 0, 0, 0) );
		this.geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0) );
		this.geometry.skinIndices.push( new THREE.Vector4( skin_index[ 2 ], 0, 0, 0) );
		this.geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0) );
	}

	smooth_vertices() {

		if ( this.data.smooth.vertices == 0 ) return; 

		//log( ' Smooth vertices:' );
		for ( let ci = 0; ci < this.cincs_count; ci++ ) {
			let _nodes = [];
			for ( let ni = 0; ni < this.cincs_count; ni++ ) {
				_nodes.push ( this.data.nodes[ ci * this.cincs_count + ni ] * this.data.scale );
			}
			//log( _nodes );
		}
		//log();
	}

	normilize_geometry_verices( i, j ) {
		
		let p0 = this.geometry.vertices[ i ];
		let p1 = this.geometry.vertices[ j ];
		let dist = DP ( p0, p1 );
		
		if ( dist < this.data.vertices_epsilon ) {
			let m = new THREE.Vector3( ( p0.x + p1.x ) / 2, ( p0.y + p1.y ) / 2, ( p0.z + p1.z ) / 2 );
			this.geometry.vertices[ i ] = m;
			this.geometry.vertices[ j ] = m;
		}
	}

	smooth_normals() {
		
		if ( this.data.smooth.normals == 0 ) return;

		// collect one place vertices
		var m = [];
		for (  let i = 0; i < this.geometry.vertices.length; i++ ) {
			
			let r = [];
			for ( let j = 0; j < this.geometry.vertices.length; j++ ) {
				
				this.normilize_geometry_verices( i, j );
				
				if ( this.geometry.vertices[ i ].x == this.geometry.vertices[ j ] .x &&
					 this.geometry.vertices[ i ].y == this.geometry.vertices[ j ] .y && 
					 this.geometry.vertices[ i ].z == this.geometry.vertices[ j ].z ) r.push( j );
				}
			
			if ( r.length > 1 ) {
				
				var exist = false;
				for ( let j = 0; j < m.length; j++ ) {
					if ( m[ j ].length == r.length ) {
						var equal = true;
						for ( let k = 0; k < r.length; k++ )
							if ( m[ j ][ k ] != r[ k ] ) { equal = false; break; }
						if ( equal ) { exist = true; break; }
					}
					if ( exist ) break;
				}
						
				if ( !exist ) m.push( r );
			}
		}

		// smooth normals
		for ( let i = 0; i < m.length; i++ ) {
			
			var n = [];
			for( let j = 0; j < m[i].length; j++ ) {
				var vi = m[i][j];					// vertex index
				var fi = Math.floor( vi / 3 );		// face index
				var fvi = vi % 3;					// vertex index in face
				var f = this.geometry.faces[fi];	// face
				
				let vn = f.vertexNormals[ fvi ];	// vertex normal
				let exist = false;
				for( let k = 0; k<n.length; k++) 
					if ( n[k].x == vn.x && n[k].y == vn.y &&  n[k].z == vn.z) {
						exist = true;
						break;
					}
				if ( !exist ) n.push( vn );	
			}
			
			var c = GV( n ); 						// middle of vectors

			for( let j = 0; j < m[i].length; j++ ) {
				
				var vi = m[i][j];					// vertex index
				var fi = Math.floor( vi / 3 );		// face index
				var fvi = vi % 3;					// vertex index in face
				var f = this.geometry.faces[ fi ];	// face
				
				var d = DV( c, f.vertexNormals[ fvi ] );
				var ld = LV( d );

				if ( ld < this.data.smooth.normals ) 
					f.vertexNormals[ fvi ] = c;		// set vertex normal
			}
		}
	}

	first_bone() {
		return this.data.bones[ 0 ];
	}

	last_bone() {
		return this.data.bones[ this.data.bones.length - 1 ];
	}
}