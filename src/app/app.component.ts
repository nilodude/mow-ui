import { Component, ElementRef } from '@angular/core';
import { TerminalService } from 'primeng/terminal';
import { Subscription } from 'rxjs';
import { MatlabService } from './matlab.service';
import { MatlabResponse, MatlabSession } from './models';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem, Message } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TerminalService],
})
export class AppComponent {
  title = 'front';
  subscription: Subscription = new Subscription();
  session: MatlabSession = new MatlabSession();
  sessions: MatlabSession[];
  matlabResponse: MatlabResponse;
  figures: string[];
  menuItems: MenuItem[];
  element: HTMLElement;
  msgs: Message[];
  menuItemSessions: MenuItem[];

  constructor(
    private terminalService: TerminalService,
    private matlabService: MatlabService,
    private host: ElementRef
  ) {
    this.terminalService.commandHandler.subscribe((command) => {
      if (this.session.sid) {
        this.matlabService.runCommand(this.session.sid, command).subscribe(
          (result) => {
            this.matlabResponse = result as MatlabResponse;
            this.terminalService.sendResponse(this.matlabResponse.result);

            this.host.nativeElement.focus();
            console.log('clicked?');
          },
          (error) => {
            console.log(error);
          }
        );
      } else {
        this.terminalService.sendResponse('No Matlab workspaces running!');
      }
    });
  }

  ngOnInit() {
    this.getSessions();

    this.element = document.getElementById('termi') as HTMLElement;
    this.menuItems = [
      {
        label: 'Start Matlab',
        icon: 'pi pi-fw pi-play',
        items: [
          {
            label: 'New Workspace',
            icon: 'pi pi-fw pi-plus',
            command: () => this.newWorkspace(),
          },
          {
            label: 'Join Workspace',
            icon: 'pi pi-fw pi-folder-open',
            items: this.menuItemSessions,
          },
        ],
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        items: [
          { label: 'Delete', icon: 'pi pi-fw pi-trash' },
          { label: 'Refresh', icon: 'pi pi-fw pi-refresh' },
        ],
      },
    ];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  newWorkspace(): void {
    this.msgs = [];
    this.msgs.push({
      severity: 'warn',
      summary: '',
      detail: 'Starting Workspace...',
    });

    this.matlabService.newWorkspace().subscribe(
      (result) => {
        this.session = result.session as MatlabSession;
        this.msgs = [];
        this.msgs.push({
          severity: 'success',
          summary: '',
          detail: result.result,
        });
      },
      (error) => {
        console.log(error);
        this.msgs.push({
          severity: 'error',
          summary: '',
          detail: error,
        });
      }
    );
  }

  getSessions() {
    this.menuItemSessions = [];
    this.matlabService.getSessions().subscribe(
      (result) => {
        this.sessions = result.sessions as MatlabSession[];
        const runningSessions = this.sessions.filter((each) => each.pid);
        if (!runningSessions) {
          this.msgs = [];
          this.msgs.push({
            severity: 'info',
            summary: '',
            detail: 'No Matlab workspaces running!',
          });
        } else {
          this.msgs = [];
          runningSessions.forEach((session) => {
            this.msgs.push({
              severity: 'info',
              summary: '',
              detail: 'Workspace ' + session.sid + ', PID = ' + session.pid,
            });
            this.menuItemSessions.push({
              label: 'Workspace ' + session.sid + ', PID = ' + session.pid,
              command: () => this.joinWorkspace(session),
            });
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  joinWorkspace(session: MatlabSession) {
    this.session = session;
    this.msgs = [];
    this.msgs.push({
      severity: 'success',
      summary: '',
      detail: 'Joined Workspace ' + session.sid,
    });
  }
}
