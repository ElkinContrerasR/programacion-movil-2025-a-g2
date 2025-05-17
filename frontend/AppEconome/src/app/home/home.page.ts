import { Component } from '@angular/core';
import { IonicModule} from '@ionic/angular';
import { ButtonComponent } from '../components/button/button.component';
import { HeaderComponent } from '../components/header/header.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, ButtonComponent,HeaderComponent, RouterModule, FormsModule ],
})
export class HomePage {
  constructor() {}
}
