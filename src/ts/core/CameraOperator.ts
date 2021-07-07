import * as THREE from 'three';
import * as Utils from './FunctionLibrary';
import { World } from '../world/World';
import { IInputReceiver } from '../interfaces/IInputReceiver';
import { KeyBinding } from './KeyBinding';
import { Character } from '../characters/Character';
import _ = require('lodash');
import { IUpdatable } from '../interfaces/IUpdatable';

export class CameraOperator implements IInputReceiver, IUpdatable
{
	public updateOrder: number = 4;

	public world: World;
	public camera: THREE.Camera;
	public target: THREE.Vector3;
	public sensitivity: THREE.Vector2;
	public radius: number = 1;
	public theta: number;
	public phi: number;
	public onMouseDownPosition: THREE.Vector2;
	public onMouseDownTheta: any;
	public onMouseDownPhi: any;
	public targetRadius: number = 1;

	public movementSpeed: number;
	public actions: { [action: string]: KeyBinding };

	public upVelocity: number = 0;
	public forwardVelocity: number = 0;
	public rightVelocity: number = 0;

	public followMode: boolean = false;

	public characterCaller: Character;

	private _viewpoint: any = {
		position:  THREE.Vector3,
		direction:  THREE.Vector3,
	};
	private _viewpoints: any;

	private _currentCam: any = {
		name: String,
		type: 0,
		types: [ 'follow', 'free', 'orbital' ],
		view: 0,
		views: Array,
	}


	constructor(world: World, camera: THREE.Camera, sensitivityX: number = 1, sensitivityY: number = sensitivityX * 0.8)
	{
		this.world = world;
		this.camera = camera;
		this.target = new THREE.Vector3();
		this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);

		this.movementSpeed = 0.06;
		this.radius = 3;
		this.theta = 0;
		this.phi = 0;

		this.onMouseDownPosition = new THREE.Vector2();
		this.onMouseDownTheta = this.theta;
		this.onMouseDownPhi = this.phi;

		this.actions = {
			'forward': new KeyBinding('KeyW'),
			'back': new KeyBinding('KeyS'),
			'left': new KeyBinding('KeyA'),
			'right': new KeyBinding('KeyD'),
			'up': new KeyBinding('KeyE'),
			'down': new KeyBinding('KeyQ'),
			'fast': new KeyBinding('ShiftLeft'),
		};

		world.registerUpdatable(this);
		this.initViews();
	}

	private initViews(){
		this._viewpoint.position = new THREE.Vector3();
		this._viewpoint.direction = new THREE.Vector3();
		this._viewpoints = {
			shared: [
				// {
				//   position: new THREE.Vector3( 0, 3, -5),
				//   direction: new THREE.Vector3(0, 3, 5),
				//   desc: 'Far'
				// },
				// {
				//   position: new THREE.Vector3( 0, 10, 0),
				//   direction: new THREE.Vector3(0, -20, 0),
				//   desc: 'Far top'
				// },
			],
			defaults: [
				{
					position: new THREE.Vector3( 0, 3, -5),
					direction: new THREE.Vector3(0, 3, 5),
				},
				{
					position: new THREE.Vector3( 0, 1, -5),
					direction: new THREE.Vector3(0, 3, 5),
				},
				{
					position: new THREE.Vector3( 0, .7, -.005),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Inside'
				},
			],
			Airplane: [
				{
					position: new THREE.Vector3( 0, 3, -5),
					direction: new THREE.Vector3(0, 3, 5),
				},
				{
					position: new THREE.Vector3( 0, .7, -.15),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Pilot'
				},
				{
					position: new THREE.Vector3( 0, 1, -5),
					direction: new THREE.Vector3(0, 3, 5),
				},
				{
					position: new THREE.Vector3( 0, .7, .2),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Front'
				},
				{
					position: new THREE.Vector3( 0, 1, -1),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Back'
				},
			],
			Character: [
				{
					position: new THREE.Vector3( 0, .5, -1.5),
					direction: new THREE.Vector3(0, .5, .5),
					desc: 'Third person'
				},
				{
					position: new THREE.Vector3( 0, .3, -.3),
					direction: new THREE.Vector3(0, 0, 10),
					lerp: false,
					desc: 'First person'
				},
				{
					position: new THREE.Vector3( -.5, .4, -1),
					direction: new THREE.Vector3(-.8, .4, .2),
					desc: 'Over the shoulder'
				},
		 ],
			Car: [
				{
					position: new THREE.Vector3( 0, 1, -3),
					direction: new THREE.Vector3(0, 1, 1),
					desc: 'Behind'
				},
				{
					position: new THREE.Vector3( .15, .6, .07),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Driver'
				},
				{
					position: new THREE.Vector3( -.2, .6, 0),
					direction: new THREE.Vector3(3.14, 0, 0),
					lerp: false,
					desc: 'Passenger sit'
				},
				{
					position: new THREE.Vector3( 0, .5, 1),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Front'
				},
			],
			Helicopter:
			[
				{
				position: new THREE.Vector3( 0, 2, -3),
				direction: new THREE.Vector3(0, 1, 1),
				},
				{
					position: new THREE.Vector3( .15, .3, .1),
					direction: new THREE.Vector3(0, 0, 0),
					lerp: false,
					desc: 'Pilot'
				},
			]
		}
		this._currentCam.name = 'Character';
		this._currentCam.views = [ ...this._viewpoints.Character, ...this._viewpoints.shared ];
	}

	public setSensitivity(sensitivityX: number, sensitivityY: number = sensitivityX): void
	{
		this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
	}

	public setRadius(value: number, instantly: boolean = false): void
	{
		this.targetRadius = Math.max(0.001, value);
		if (instantly === true)
		{
			this.radius = value;
		}
	}

	public move(deltaX: number, deltaY: number): void
	{
		this.theta -= deltaX * (this.sensitivity.x / 2);
		this.theta %= 360;
		this.phi += deltaY * (this.sensitivity.y / 2);
		this.phi = Math.min(85, Math.max(-85, this.phi));
	}
	public nextCamType(){
		this._currentCam.type++;
		this._currentCam.view = 0;
		if( ! this._currentCam.types[ this._currentCam.type ] )
		{
			this._currentCam.type = 0;
		}

		return this._currentCam.types[ this._currentCam.type ];
	}

	public nextView(){
		if( this._currentCam.views[ this._currentCam.view + 1 ]){
			this._currentCam.view++;
		} else {
			this._currentCam.view = 0;
		}
		return this._currentCam.view;
	}

	public get currentCamType(){
		return this._currentCam.types[ this._currentCam.type ];
	}

	public get currentCam(){
		return this._viewpoints[ this._currentCam.name ][ this._currentCam.view ];
	}

	public update(timeScale: number): void
	{

		switch ( this.currentCamType ) {
			case 'follow':
				this.followCam( timeScale );
				break;
			case 'free':
				this.freeCam();
				break;
				default:
				this.freeCam();
				break;
		}

	}

	private freeCam( ){
		this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, 0.1);
		this.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
		this.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 180);
		this.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
		this.camera.updateMatrix();
		this.camera.lookAt(this.target);
	}

	private _viewpointRelativeTo(target: any){
		let name = target.classname;
		name = this._viewpoints[ name ] ? name : 'defaults';
		this._currentCam.name = name;
		this._currentCam.views = [ ...this._viewpoints[ this._currentCam.name ], ...this._viewpoints.shared ];

		const pov = this._currentCam.views[ this._currentCam.view ] ?? this._currentCam.views[ this._currentCam.views.length - 1 ];

		const position = pov.position.clone();
		position.applyQuaternion( target.quaternion );
		position.add( target.position );

		const direction = pov.direction.clone();
		direction.applyQuaternion( target.quaternion );
		direction.add( target.position );

		return { position, direction, lerp: pov.lerp };
	}

	private followCam( timeScale: number ){
		let player = this.world.characters.find( char => char.uuid === this.world.player_id );

		if( !player ) {
			return;
		}

		const t = 1.0 - Math.pow( 0.001, timeScale ) ;
		let pov: any;

		if( player.controlledObject ){
			pov = this._viewpointRelativeTo( player.controlledObject );
			this.camera.setRotationFromQuaternion( player.controlledObject.quaternion );
			let rot = player.controlledObject.quaternion.clone();
			rot.setFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI  );
			this.camera.quaternion.multiplyQuaternions( rot, this.camera.quaternion );
			this.camera.rotation.x = - this.camera.rotation.x;

			if( player.controlledObject.speed >= -2.8 )
			{
				this.camera.rotation.z = - this.camera.rotation.z;
			}
			else
			{
				this.camera.rotation.y += Math.PI;
			}

		} else if( player.parent instanceof THREE.Scene ) {

			pov = this._viewpointRelativeTo( player );
			this._viewpoint.direction.lerp( pov.direction, t );
			this.camera.lookAt( this._viewpoint.direction );

		} else {
			this.camera.lookAt( this.target );
			return;
		}
		if( pov.lerp === false ){
			this._viewpoint.position.copy( pov.position );
		} else {
			this._viewpoint.position.lerp( pov.position, t );
		}
		this.camera.position.copy( this._viewpoint.position );
	}

	public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
	{
		// Exit free camera
		if (code === 'KeyV' && pressed === true && event.ctrlKey === true)
		{
			if (this.characterCaller !== undefined)
			{
				this.world.inputManager.setInputReceiver(this.characterCaller);
				this.characterCaller = undefined;
				this.nextCamType();
			}
		}
		else
		{
			for (const action in this.actions) {
				if (this.actions.hasOwnProperty(action)) {
					const binding = this.actions[action];
	
					if (_.includes(binding.eventCodes, code))
					{
						binding.isPressed = pressed;
					}
				}
			}
		}
	}


	public handleMouseWheel(event: WheelEvent, value: number): void
	{
		this.world.scrollTheTimeScale(value);
	}

	public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
	{
		for (const action in this.actions) {
			if (this.actions.hasOwnProperty(action)) {
				const binding = this.actions[action];

				if (_.includes(binding.eventCodes, code))
				{
					binding.isPressed = pressed;
				}
			}
		}
	}

	public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
	{
		this.move(deltaX, deltaY);
	}

	public inputReceiverInit(): void
	{
		this.target.copy(this.camera.position);
		this.setRadius(0, true);
		// this.world.dirLight.target = this.world.camera;

		this.world.updateControls([
			{
				keys: ['W', 'S', 'A', 'D'],
				desc: 'Move around'
			},
			{
				keys: ['E', 'Q'],
				desc: 'Move up / down'
			},
			{
				keys: ['Shift'],
				desc: 'Speed up'
			},
			{
				keys: ['Ctrl', '+', 'V'],
				desc: 'Change camera'
			}
		]);
	}

	public inputReceiverUpdate(timeStep: number): void
	{
		// Set fly speed
		let speed = this.movementSpeed * (this.actions.fast.isPressed ? timeStep * 600 : timeStep * 60);

		const up = Utils.getUp(this.camera);
		const right = Utils.getRight(this.camera);
		const forward = Utils.getBack(this.camera);

		this.upVelocity = THREE.MathUtils.lerp(this.upVelocity, +this.actions.up.isPressed - +this.actions.down.isPressed, 0.3);
		this.forwardVelocity = THREE.MathUtils.lerp(this.forwardVelocity, +this.actions.forward.isPressed - +this.actions.back.isPressed, 0.3);
		this.rightVelocity = THREE.MathUtils.lerp(this.rightVelocity, +this.actions.right.isPressed - +this.actions.left.isPressed, 0.3);

		this.target.add(up.multiplyScalar(speed * this.upVelocity));
		this.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
		this.target.add(right.multiplyScalar(speed * this.rightVelocity));
	}
}