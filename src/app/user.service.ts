import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from './model/user';
import { USERS } from './mock-users';
import { Md5 } from 'ts-md5/dist/md5';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	public static userInfo: User = null;

	constructor(private cookieService: CookieService) { }

	checkFirstTime(): Observable<boolean> {
		if (!this.cookieService.check('users')) {
			this.cookieService.set('users', JSON.stringify([
				{
					id: 1,
					name: 'Admin',
					email: 'admin@email.com',
					username: 'admin',
					password: '0192023a7bbd73250516f069df18b500',
					userlevel: '1'
				},
				{
					id: 2,
					name: 'Usuário',
					email: 'user@email.com',
					username: 'user',
					password: '6ad14ba9986e3615423dfca256d04e3f',
					userlevel: '2'
				}
			]))
		}
		let users = JSON.parse(this.cookieService.get('users'));
		users.forEach(function(user) {
			USERS.push(new User(
				user['id'],
				user['name'],
				user['email'],
				user['username'],
				user['password'],
				user['userlevel']
			));
		});
		return of(true);
	}

	getUsers(): Observable<User[]> {
		return of(USERS);
	}

	getUser(id: number):Observable<User> {
		let hasUser = USERS.filter(function(existUser) {
			if (id == existUser.id) return existUser;
		});
		if (hasUser.length > 0) return of(hasUser[0]);
		else return of(null);
	}

	setLoggedUser(user: User) {
		UserService.userInfo = user;
	}

	addUser(user: User): Observable<Object> {
		let ret = new Object();
		let hasUser = USERS.filter(function(existUser) {
			if (user.username == existUser.username) return existUser;
		});
		if (hasUser.length > 0) {
			ret['error'] = true;
			ret['msg'] = 'User already exists';
		}
		else {
			// get new id
			let newId = 0;
			USERS.forEach(function(user) {
				if (user.id > newId) newId = user.id;
			});
			newId++;

			user.id = newId;
			USERS.push(user);
			let cookieAux = JSON.parse(this.cookieService.get('users'));
			cookieAux.push({
				id: user.id,
				name: user.name,
				email: user.email,
				username: user.username,
				password: user.password,
				userlevel: user.userlevel
			});
			this.cookieService.set('users', JSON.stringify(cookieAux));
			ret['error'] = false;
			ret['msg'] = 'User successfully registered';
		}
		return of(ret);
	}

	updateUser(user: User, editedPassword: boolean) {
		let ret = new Object();
		let hasUser = USERS.filter(function(existUser) {
			if (user.id == existUser.id) return existUser;
		});
		if (hasUser.length == 0) {
			ret['error'] = true;
			ret['msg'] = 'User not found';
		}
		else {
			let hasAnotherUser = USERS.filter(function(existUser) {
				if (user.id != existUser.id && user.username == existUser.username) return existUser;
			});
			
			if (hasAnotherUser.length > 0) {
				ret['error'] = true;
				ret['msg'] = 'A user with this username already exists';
			}
			else {
				USERS.forEach(function(_user) {
					if (user.id == _user.id) {
						_user.name = user.name;
						_user.email = user.email;
						_user.userlevel = user.userlevel;
						if (editedPassword) {
							_user.password = user.password
						}
					}
				});

				this.cookieService.set('users', JSON.stringify(USERS));
				ret['error'] = false;
				ret['msg'] = 'User successfully updated';
			}
		}
		return of(ret);
	}

	logout() {
		UserService.userInfo = null;
	}
}
