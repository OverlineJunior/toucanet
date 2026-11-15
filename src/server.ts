import {
	type Component,
	component,
	type Entity,
	type Scheduler,
} from '@rbxts/toucan'
import {
	getComponentSharedIdentity,
	replicateOnClient,
	unreplicateOnClient,
} from './shared'

export type Lifetime = 'persistent' | 'bound'

export const Replicated = component<{
	lifetime?: Lifetime
	replicateTo?: (client: Player) => boolean
	_replicatedTo?: Player[]
}>('Replicated')
Replicated.onChanged((e, r) => {
	// Replicated starts out without _replicatedTo, so if it's empty,
	// that's because we first added clients and then removed enough
	// of them to empty it.
	if (r._replicatedTo?.isEmpty()) {
		e.remove(Replicated)
	}
})

/**
 * A collection of component replication policies.
 */
export const Replicate = {
	/** Replicates the component once it's added. */
	OnAdd: component('OnAdd'),
	/** Replicates the component once it's added and removed. */
	OnAddRemove: component('OnAddRemove'),
	/** Replicates the component on every value or existance change. */
	OnChange: component('OnChange'),
	/** Replicates the component on every n seconds. Sent unreliably. */
	OnInterval: component<number>('OnInterval'),
	/** Replicates the component on every n seconds. Sent reliably. */
	OnIntervalReliable: component<number>('OnIntervalReliable'),
}

function encodeComponent(comp: Component, value: unknown): [string, unknown] {
	return [getComponentSharedIdentity(comp), value]
}

export function replicateOnClients(clients: Player[], entity: Entity): void {
	const replicated = entity.get(Replicated)
	const replicatedTo = replicated?._replicatedTo ?? []
	const clientsLeft = replicatedTo.isEmpty()
		? clients
		: clients.filter((c) => !replicatedTo.includes(c))

	const encodedComponents = entity
		.components()
		.map((c) => encodeComponent(c, entity.get(c)))

	clientsLeft.forEach((c) => {
		replicateOnClient.FireClient(c, encodedComponents, entity.id)
	})

	entity.set(Replicated, {
		...replicated,
		_replicatedTo: [...replicatedTo, ...clientsLeft],
	})
}

export function unreplicateOnClients(clients: Player[], entity: Entity): void {
	const replicated = entity.get(Replicated)
	if (!replicated) return

	const replicatedTo = replicated._replicatedTo ?? []
	const replicatedClients = clients.filter((c) => replicatedTo.includes(c))

	replicatedClients.forEach((c) => {
		unreplicateOnClient.FireClient(c, entity.id)
	})

	entity.set(Replicated, {
		...replicated,
		_replicatedTo: replicatedTo.filter((c) => !replicatedClients.includes(c)),
	})
}

export function toucanetServer(_sched: Scheduler) {}
