<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed, watch } from 'vue';
import type { Ref } from 'vue';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import FieldSet from 'primevue/fieldset';
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

import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';
import Checkbox from 'primevue/checkbox';
import Step4_SiteNamesView from '@/bcrhp/pages/NewSite/steps/Step4_SiteNamesView.vue';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const currentOtherName: Ref<SiteNamesTileType> = ref(null);
const otherNameKey = ref(0);

const filterNamesByType = function (name_type: string) {
    if (!heritageSite.value) {
        return [];
    }
    return heritageSite.value.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === name_type,
    );
};

const currentCommonName = filterNamesByType('Common')?.[0] ?? ref(null);

// const currentCommonName: Ref<SiteNamesTileType | null> = ref(commonName);

const otherNames = computed(() => {
    return filterNamesByType('Other');
});

const commonNameForm: Ref<FormInstance | null> = useTemplateRef(
    'commonNameForm',
) as Ref<FormInstance | null>;
const otherNameForm: Ref<FormInstance | null> = useTemplateRef(
    'otherNameForm',
) as Ref<FormInstance | null>;
const zodCommonNameResolver = getFlattenResolver(
    zodResolver(SiteNamesTileSchema.shape['aliased_data']),
);

const zodOtherNameResolver = getFlattenResolver(
    zodResolver(SiteNamesTileSchema.shape['aliased_data']),
);

const isValid = () => {
    return isCommonNameValid() && true;
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
    const commonNameArray = filterNamesByType('Common');
    if (commonNameArray.length === 0) {
        getBlankCommonName().then((blankCommonName) => {
            heritageSite.value.aliased_data.site_names = [
                blankCommonName,
                ...heritageSite.value.aliased_data.site_names,
            ];
            baseUpdateModelValue(
                newValue,
                attribute_name,
                blankCommonName.aliased_data,
                commonNameForm as Ref<FormInstance>,
            );
            emit('update:stepIsValid', isValid());
        });
    } else {
        const commonName = commonNameArray?.[0];
        baseUpdateModelValue(
            newValue,
            attribute_name,
            commonName,
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
    // Push the current object
    heritageSite?.value?.aliased_data.site_names.push(currentOtherName.value);

    // Get a fresh blank object for the next entry
    getBlankOtherName().then((blankOtherName) => {
        currentOtherName.value = blankOtherName;

        // Force UI reset
        otherNameKey.value++;
        otherNameForm.value?.reset();

        emit('update:stepIsValid', isValid());
    });
};

const addOtherNameDisabled = computed(
    () => !isOtherNameValid() || otherNames.value.length >= 5,
);

const deleteOtherNameCallback = function (nameToDelete: any) {
    const arr = heritageSite?.value?.aliased_data?.site_names;
    const index = arr.indexOf(nameToDelete);

    if (index > -1) {
        arr.splice(index, 1);
    }
};

const handleRemoveOtherName = (index: number) => {
    const itemToRemove = otherNames.value[index];
    if (itemToRemove) {
        deleteOtherNameCallback(itemToRemove);
    }
};

defineExpose({ isValid });

const isEditing = ref(false);
watch(
    () => [isEditing.value, commonNameForm.value?.valid] as const,
    (valid) => {
        console.log('hi', valid);
        if (!isEditing.value) {
            const parseResult = SiteNamesTileSchema.shape[
                'aliased_data'
            ].safeParse(filterNamesByType('Common')?.[0]?.aliased_data);
            return parseResult.success;
        } else {
            emit('update:stepIsValid', isValid());
        }
    },
    { immediate: true },
);

onMounted(() => {
    getBlankOtherName().then((blankOtherName) => {
        currentOtherName.value = blankOtherName;
    });
});
</script>

<template>
    <div>
        <Checkbox
            id="editAddressCheckbox"
            v-model="isEditing"
            binary
        ></Checkbox>
        <label for="editAddressCheckbox">Edit Names</label>
        <Step4_SiteNamesView v-if="!isEditing" />
        <hr />
    </div>
    <div v-if="isEditing">
        <FieldSet
            id="siteNamesFieldSet"
            legend="Site Names"
        >
            <Form
                ref="commonNameForm"
                v-slot="$form"
                name="commonNameForm"
                :validateOnBlur="true"
                :validateOnMount="true"
                :resolver="zodCommonNameResolver"
            >
                <LabelledInput
                    label="Common Name"
                    hint="Enter the site name to be the common name (e.g. Emily Carr House), if the site does not have a commonly known name use the street address (e.g. 123 Government St.)"
                    input-name="commonName"
                    :error-message="$form.commonName?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentCommonName?.aliased_data?.name
                            "
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
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :key="otherNameKey"
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="currentOtherName"
                            graph-slug="heritage_site"
                            node-alias="name"
                            @update:value="updateOtherName($event, 'name')"
                        />
                    </div>
                </LabelledInput>
            </Form>
        </FieldSet>
        <br />
        <div class="row">
            <Button
                id="addOtherName"
                class="button-padding"
                label="+ Add"
                :aria-disabled="addOtherNameDisabled"
                :disabled="addOtherNameDisabled"
                @click="saveOtherName"
            ></Button>

            <ChipsList
                :items="otherNames"
                :display-keys="['aliased_data.name.display_value']"
                :emptyText="'No other names added.'"
                @remove="handleRemoveOtherName"
            />
        </div>
        <br /><br /><br /><br /><br />
    </div>
</template>
