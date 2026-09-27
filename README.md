# DSH Task Master

A compact Windows task-manager tab for DeepSeek Harness Web. The sidebar opens three focused views: **Sessions** with DSH-managed jobs and terminals, **Processes** with TCP listeners, and **Dev Gateways** (optional). The Sessions view supports workspace/Session search, All/Running/Idle/Inactive status, activity filtering (running turns or managed tasks), and an archived-Session toggle. Archived Sessions are hidden by default; the toggle only changes what is displayed, never the underlying DSH archive.

Ownership is shown as **confirmed**, **suspected**, or **unknown**. Confirmed means DSH owns the task or exact terminal process. Suspected means a process command line or executable path mentions one registered Workspace; it does **not** establish Session ownership. Unknown means no supported attribution was found. Only TCP listeners are included in the OS process list; a process without a listening port may still be running.

## Install from GitHub

Clone this repository and add its local directory as a bundle to the intended DSH profile, or add it through that profile's Plugins page:

```powershell
git clone https://github.com/Pascapone/dsh-task-master.git
dsh plugin --profile web add "link:$((Resolve-Path ./dsh-task-master).Path)"
```

Use your own profile name in place of `web`. The package is `@pascapone/dsh-task-master`; it is distributed through GitHub, not the npm registry. A Web client reload or profile restart may be needed after updating an installed bundle.

## Stop actions and scope

- Jobs and terminals use DSH's owner-fenced cancellation/close paths; stopping a Session turn does **not** imply stopping an independent server.
- If an optional `devGateways` Host service is available, Dev Gateways lists its managed instances and offers Open, Logs, Extend and Stop. Gateway actions use only that service (`{ operator: true }`), never the generic PID-kill path. Missing or failing discovery leaves Sessions and Processes usable; no extra dependency is required. All POST actions verify Connection operator admission.
- For an OS listener, the action targets **one PID**, not a process tree. The Host rechecks the listening PID and uses a single Windows process handle to compare creation time, terminate and await exit. Critical/system processes, the running Gateway and its ancestors, and recognizable DSH gateways are protected.
- A confirmation is required before stopping. An unknown or suspected listener could belong to another application; inspect it before confirming. Browser access to this route inherits DSH's operator-level authentication, not separate per-user OS-process permissions. Do not expose the Web UI to untrusted operators.
- Process discovery requires Windows PowerShell (`Get-CimInstance`, `Get-NetTCPConnection`) and permission to inspect the relevant processes. It cannot reconstruct every detached process's original DSH Session after the fact.

Run `npm test` to exercise the Client's tabs and filters, Host attribution and endpoint, and (on Windows) a temporary, test-owned TCP server with process-identity-checked termination. The test never targets existing applications.
