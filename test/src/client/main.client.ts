import { Builtin, scheduler } from '@rbxts/toucan'
import { themes, toucanDebuggerClient } from '@rbxts/toucan-debugger'
import { toucanetClient } from '@rbxts/toucanet'
import { IsAlive } from 'shared/components'

// We need to require test/src/shared/components, otherwise the components will
// only exist on the server. `getComponentByLabel` in src/client.ts will error because of this.
IsAlive
Builtin.Entity

scheduler()
	.usePlugin(toucanetClient)
	.usePlugin(toucanDebuggerClient, {
		toggleKeybind: Enum.KeyCode.F4,
		theme: themes.black,
	})
	.run()
