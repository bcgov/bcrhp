<script setup lang="ts">
import Chip from 'primevue/chip';
import { computed, type PropType } from 'vue';

const props = defineProps({
    label: { type: String, default: '' },
    items: { type: Array<any>, default: () => [] },
    displayFunction: {
        type: Function as PropType<(item: any) => string>,
        default: null,
    },
    displayKeys: { type: Array<string>, default: () => [] },
    disabledFunction: {
        type: Function as PropType<(item: any) => boolean>,
        default: null,
    },
    disabled: { type: Boolean, default: false },
    emptyText: { type: String, default: 'No items added.' },
});
const fallbackKeys = new WeakMap<object, string>();
let keyCounter = 0;

const emit = defineEmits(['remove', 'click']);

const getValueFromPath = (item: any, path: string) => {
    try {
        const val = path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : null;
        }, item);

        if (val && typeof val === 'object') {
            if (val.display_value) return val.display_value;
            if (val.node_value?.en?.value) return val.node_value.en.value;
            if (val.node_value?.value) return val.node_value.value;
            if (typeof val.node_value === 'string') return val.node_value;

            return '';
        }
        return val;
    } catch (e) {
        return '';
    }
};

const resolveLabel = (item: any) => {
    if (props.displayFunction) {
        return props.displayFunction(item);
    }

    if (props.displayKeys && props.displayKeys.length > 0) {
        return props.displayKeys
            .map((key) => getValueFromPath(item, String(key)))
            .filter((val) => val !== null && val !== '' && val !== undefined)
            .join(' - ');
    }

    return item;
};

const handleRemove = (event: Event, index: number) => {
    if (!props.disabled) {
        emit('remove', index);
    }
};

const handleClick = (index: number) => {
    if (!props.disabled) {
        emit('click', index);
    }
};

const getUniqueKey = (item: any) => {
    if (typeof item !== 'object' || item === null) {
        return String(item);
    }

    if (!fallbackKeys.has(item)) {
        fallbackKeys.set(item, `new-chip-${keyCounter++}`);
    }

    return fallbackKeys.get(item);
};

const itemDisabled = (item: any): boolean => {
    if (props.disabledFunction) {
        return props.disabledFunction(item);
    }
    return props.disabled ?? false;
};

function chipColor(item: any) {
    return itemDisabled(item) ? '#444' : 'var(--p-chip-color)';
}
</script>

<template>
    <div>
        <div v-if="label">
            <label>
                {{ label }}
                <span>({{ items?.length || 0 }})</span>
            </label>
            <slot name="actions"></slot>
        </div>

        <div v-if="items && items.length > 0">
            <Chip
                v-for="(item, index) in items"
                :key="getUniqueKey(item)"
                :label="String(resolveLabel(item) || 'Untitled')"
                :removable="!itemDisabled(item)"
                :style="{
                    '--p-chip-padding-x': '1.5rem',
                    '--p-chip-color': chipColor(item),
                }"
                @remove="handleRemove($event, index)"
                @click="handleClick(index)"
            >
                <template
                    v-if="$slots.item"
                    #default
                >
                    <slot
                        name="item"
                        :item="item"
                        :index="index"
                    ></slot>
                </template>
            </Chip>
        </div>

        <div v-else>{{ emptyText }}</div>
    </div>
</template>
