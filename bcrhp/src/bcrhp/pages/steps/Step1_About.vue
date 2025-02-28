<script setup lang="ts">

const isValid = () => {
  return true;
};

defineExpose({ isValid });

</script>
<template>
  <div
    class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 font-medium">
    <div class="p-4 ml-4">
      <h3 class="mb-2">Before you begin</h3>
      <div class="mb-2">
        <p>Confirm the site does not already exist on the BC Register of Historic Places by doing the following
          searches on the <a href="">Search Page.</a> Consult the <a href="">How to Search PDF Guide</a> as needed.
        </p>
      </div>
      <ul class="list-disc ml-4">
        <li>
          Keyword search in the Find a resource... search bar
        </li>
        <li>
          Address search in the map Find an address... search bar
        </li>
        <li>
          Zoom into map location and verify there is no site
        </li>
      </ul>
      <h3 class="mb-2">Submission Requirements</h3>
      <ul class="list-disc ml-4">
        <li>
          Steps 1-5 are mandatory to complete the basic data requirements for a notification.
        </li>
        <li>
          Required documents for Step 11 include:
          <ul class="list-disc ml-4">
            <li>
              Covering notification letter
            </li>
            <li>
              Copy of Bylaw, Resolution, or Meeting Minutes
            </li>
            <li>
              GIS files or Site Map
            </li>
          </ul>
        </li>
      </ul>
      <div>
        See the Heritage Property Notifications Guide for more information including Canadian Register Nomination
        Requirements. It is highly recommended to complete the remaining steps if information is available to improve
        the historic site’s search ability on the register.
      </div>
    </div>
  </div>
</template>

<style>
li {
  color: unset;
  font-size: unset;
}
</style>
