<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
  const { $colorMode } = useNuxtApp()
  console.log($colorMode.preference)
</script>