import { event } from '@rbxts/link'
import { Builtin, type Component, component, type RawId } from '@rbxts/toucan'

export type EncodedComponent = [string, unknown]

export const ServerEntityId = component<number>('ServerEntityId')

export const replicateOnClient = event<[EncodedComponent[], RawId]>()
export const unreplicateOnClient = event<[RawId]>()

export function getComponentSharedIdentity(comp: Component): string {
	const label = comp.get(Builtin.Label)
	assert(
		label !== undefined,
		`Cannot replicate ${comp} because it does not have a label`,
	)

	return label
}
