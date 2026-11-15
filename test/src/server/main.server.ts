import { Players } from '@rbxts/services'
import { entity, scheduler } from '@rbxts/toucan'
import { toucanDebuggerServer } from '@rbxts/toucan-debugger'
import { replicateOnClients, toucanetServer } from '@rbxts/toucanet'
import { Age, IsAlive } from 'shared/components'
import { unreplicateOnClients } from '../../../out/server'

function spawnClientEntity() {
	const e = entity('Alice').set(IsAlive).set(Age, 22)

	Players.PlayerAdded.Connect((player) => {
		while (true) {
			print('Replicate')
			replicateOnClients([player], e)
			task.wait(5)
			print('Unreplicate')
			unreplicateOnClients([player], e)
			task.wait(5)
		}
	})
}

scheduler()
	.usePlugin(toucanetServer)
	.usePlugin(toucanDebuggerServer)
	.useSystem('startup', spawnClientEntity)
	.run()
