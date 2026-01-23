<script setup lang="ts">
import Chip from 'primevue/chip';

const props = defineProps({
    label: { type: String, default: '' },
    items: { type: Array<any>, default: () => [] },
    displayKey: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['remove']);

const resolveLabel = (item: any) => {
    if (!props.displayKey || typeof item !== 'object' || item === null) {
        return item;
    }

    //specific fix for undefined
    try {
        return props.displayKey.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : null;
        }, item);
    } catch (e) {
        return '';
    }
};

const handleRemove = (index: number) => {
    if (!props.disabled) {
        emit('remove', index);
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
            class="flex flex-col items-start gap-2"
            v-if="items && items.length > 0"
        >
            <Chip
                v-for="(item, index) in items"
                :key="index"
                :label="String(resolveLabel(item) || '')"
                :removable="!disabled"
                @remove="handleRemove(index)"
                class="text-lg py-2 px-3"
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
