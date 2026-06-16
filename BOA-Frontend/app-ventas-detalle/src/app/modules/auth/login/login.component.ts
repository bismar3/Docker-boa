import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { User } from '../../../interfaces/user.interface';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent implements OnInit {
  user!: User;
  errorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.user = {
      username: '',
      password: '',
    };
  }

  public login(): void {
    this.authService.getToken(this.user).subscribe(
      (response: User) => {
        sessionStorage.setItem("token", response.token || '');
        sessionStorage.setItem('user', JSON.stringify(response));
        sessionStorage.setItem('roles', JSON.stringify(response.roles));
        this.redirectToDashboard();
      },
      (error) => {
        this.errorMessage = error.message;
        this.router.navigate(['/auth/login']);
      }
    );
  }

  private redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}