<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import {
    getBlankCommonName,
    getBlankOtherName,
    SiteNamesTileSchema,
    type SiteNamesTileType,
} from '@/bcrhp/schemas/heritage_site/site_names.ts';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const currentCommonName: Ref<SiteNamesTileType | null> = ref(null);
const currentOtherName: Ref<SiteNamesTileType> = ref(null);
const otherNameKey = ref(0);

const otherNames = computed(() => {
    return heritageSite.value.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Other',
    );
});

const commonNameForm: Ref<FormInstance | null> = useTemplateRef(
    'commonNameForm',
) as Ref<FormInstance | null>;
const otherNameForm: Ref<FormInstance | null> = useTemplateRef(
    'otherNameForm',
) as Ref<FormInstance | null>;
const zodCommonNameResolver = zodResolver(
    SiteNamesTileSchema.shape['aliased_data'],
);

const zodOtherNameResolver = getFlattenResolver(
    zodResolver(SiteNamesTileSchema.shape['aliased_data']),
);

// const isValid = () => {
//     return (
//         isCommonNameValid() &&
//         (currentOtherName.value?.aliased_data?.name?.node_value?.en?.value
//             ?.length ?? 0) === 0
//     );
// };
const isValid = () => {
    return true;
};
const isCommonNameValid = () => {
    return baseIsValid(
        commonNameForm as Ref<FormInstance>,
        SiteNamesTileSchema.shape['aliased_data'],
    );
};
const isOtherNameValid = () => {
    return baseIsValid(
        otherNameForm as Ref<FormInstance>,
        SiteNamesTileSchema.shape['aliased_data'],
    );
};

const updateCommonName = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    if (!currentCommonName.value) {
        getBlankCommonName().then((blankCommonName) => {
            currentCommonName.value = blankCommonName;
            heritageSite.value.aliased_data.site_names = [
                currentCommonName.value,
                ...heritageSite.value.aliased_data.site_names,
            ];
            baseUpdateModelValue(
                newValue,
                attribute_name,
                currentCommonName.value.aliased_data,
                commonNameForm as Ref<FormInstance>,
            );
            emit('update:stepIsValid', isValid());
        });
    } else {
        baseUpdateModelValue(
            newValue,
            attribute_name,
            currentCommonName.value.aliased_data,
            commonNameForm as Ref<FormInstance>,
        );
        emit('update:stepIsValid', isValid());
    }
};

const updateOtherName = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentOtherName?.value?.aliased_data,
        otherNameForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const saveOtherName = function () {
    console.log('saveOtherName');
    heritageSite?.value?.aliased_data.site_names.push(currentOtherName.value);
    
    getBlankOtherName().then((blankOtherName) => {
        currentOtherName.value = blankOtherName;
        
        // 2. Increment the key to force the GenericWidget to re-render from scratch
        otherNameKey.value++; 
        
        // Optional: Reset the form validation state to remove any "touched" or error states
        otherNameForm.value?.reset(); 

        emit('update:stepIsValid', isValid());
    });
};

const addOtherNameDisabled = computed(
    () => !isOtherNameValid() || otherNames.value.length >= 4,
);

const deleteOtherNameCallback = function (index: number) {
    heritageSite?.value.aliased_data.site_names.splice(index, 1);
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    getBlankOtherName().then((blankOtherName) => {
        currentOtherName.value = blankOtherName;
    });
});
</script>
<template>
    <div class="flex flex-col">
        <Form
            ref="commonNameForm"
            v-slot="$form"
            name="commonNameForm"
            :validateOnBlur="true"
            :resolver="zodCommonNameResolver"
        >
            <LabelledInput
                label="Common Name"
                hint="The common name is the most recognizable name for the site"
                input-name="commonName"
                :error-message="$form.commonName?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="currentCommonName"
                        graph-slug="heritage_site"
                        node-alias="name"
                        @update:value="updateCommonName($event, 'name')"
                    />
                </div>
            </LabelledInput>
        </Form>
        <Form
            ref="otherNameForm"
            v-slot="$form"
            name="otherNameForm"
            :validateOnBlur="true"
            :resolver="zodOtherNameResolver"
        >
            <LabelledInput
                label="Other Names (Optional)"
                hint="Click Add to enter one or more additional names as applicable"
                input-name="otherName"
                :error-message="$form.otherName?.error?.message"
            >
                <GenericWidget
                    :key="otherNameKey"
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="currentOtherName"
                    graph-slug="heritage_site"
                    node-alias="name"
                    @update:value="updateOtherName($event, 'name')"
                />
            </LabelledInput>
            <div style="display: flex; flex-direction: row; gap: 1rem; align-items: flex-start;">
                
                <Button
                    id="addOtherName"
                    label="+ Add"
                    class="inline-block"
                    :aria-disabled="addOtherNameDisabled"
                    :disabled="addOtherNameDisabled"
                    @click="saveOtherName"
                ></Button>

                <div 
                    style="display: flex; flex-direction: column; gap: 2px; align-items: flex-start;" 
                    v-if="otherNames && otherNames.length > 0"
                >
                    <Chip
                        v-for="(name, index) in otherNames"
                        :key="index"
                        :label="name?.aliased_data?.name.display_value"
                        removable
                        @remove="deleteOtherNameCallback(index)"
                        class="text-lg py-2 px-3"
                    />
                </div>
            </div>
        </Form>
        <br/><br/><br/><br/><br/>
    </div>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.p-inputtext-fluid.inline-block {
    width: calc(100% - 6.5rem);
    margin-right: 1rem;
}
</style>
