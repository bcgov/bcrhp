<script setup lang="ts">
import Chip from 'primevue/chip';

const props = defineProps({
    label: { type: String, default: '' },
    items: { type: Array<any>, default: () => [] },
    displayKey: { type: String, default: '' },
    displayKeys: { type: Array<String>, default: () => [] },
    disabled: { type: Boolean, default: false },
});

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
    if (props.displayKeys && props.displayKeys.length > 0) {
        return props.displayKeys
            .map((key) => getValueFromPath(item, String(key)))
            .filter((val) => val !== null && val !== '' && val !== undefined)
            .join(' - ');
    }

    if (props.displayKey) {
        return getValueFromPath(item, props.displayKey);
    }

    return item;
};

const handleRemove = (index: number) => {
    if (!props.disabled) {
        emit('remove', index);
    }
};
const handleClick = (index: number) => {
    if (!props.disabled) {
        emit('click', index);
    }
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <div
            v-if="label"
            class="flex justify-between items-center"
        >
            <label class="font-semibold text-gray-700">
                {{ label }}
                <span class="text-gray-500 text-sm"
                    >({{ items?.length || 0 }})</span
                >
            </label>
            <slot name="actions"></slot>
        </div>

        <div
            v-if="items && items.length > 0"
            class="flex flex-col items-start gap-2"
        >
            <Chip
                v-for="(item, index) in items"
                :key="index"
                :label="String(resolveLabel(item) || 'Untitled')"
                :removable="!disabled"
                class="text-lg py-2 px-3"
                @remove="handleRemove(index)"
                @click="handleClick(index)"
            >
                <template
                    #default
                    v-if="$slots.item"
                >
                    <slot
                        name="item"
                        :item="item"
                        :index="index"
                    ></slot>
                </template>
            </Chip>
        </div>

        <div
            v-else
            class="text-gray-400 italic text-sm"
        >
            No items added.
        </div>
    </div>
</template>
