import { Routes } from '@angular/router';

import { LobbyComponent } from './components/lobby/lobby.component';
import { GameTableComponent } from './components/game-table/game-table.component';

import { LobbySettingsComponent } from './components/lobby-settings/lobby-settings.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'settings/:id', component: LobbySettingsComponent },
  { path: 'game/:id', component: GameTableComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect to lobby for any other route
];
