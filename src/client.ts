import {
	Builtin,
	type Component,
	entity,
	query,
	type Scheduler,
} from '@rbxts/toucan'
import {
	type EncodedComponent,
	replicateOnClient,
	ServerEntityId,
	unreplicateOnClient,
} from './shared'

function getComponentByLabel(label: string): Component {
	const c = query(Builtin.Component).find(
		(c) => c.get(Builtin.Label) === label,
	)?.[0] as Component | undefined
	assert(
		c !== undefined,
		`Could not find a component labeled ${label} on the client-side`,
	)
	return c
}

function decodeComponent(ec: EncodedComponent): [Component, unknown] {
	return [getComponentByLabel(ec[0]), ec[1]]
}

function spawnReplicatedEntity() {
	replicateOnClient.OnClientEvent.Connect((encodedComponents, serverId) => {
		const existing = query(ServerEntityId).find((_e, id) => id === serverId)
		assert(
			existing === undefined,
			`Expected client entity of ServerEntityId of ${serverId} to not exist`,
		)

		const e = entity().set(ServerEntityId, serverId)

		encodedComponents.forEach((encodedComp) => {
			const [c, v] = decodeComponent(encodedComp)
			e.set(c, v)
		})
	})
}

function despawnUnreplicatedEntity() {
	unreplicateOnClient.OnClientEvent.Connect((serverId) => {
		const res = query(ServerEntityId).find((_e, id) => id === serverId)
		assert(
			res !== undefined,
			`Expected to find a client entity with a ServerEntityId of ${serverId}`,
		)

		res[0].despawn()
	})
}

export function toucanetClient(sched: Scheduler) {
	sched
		.useSystem('preStartup', spawnReplicatedEntity)
		.useSystem('preStartup', despawnUnreplicatedEntity)
}
