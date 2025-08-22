<script
  lang="ts"
  setup
>


</script>

<template>
  <div class="h-screen w-screen p-8">
    <div class="text-2xl flex justify-center">盒对齐</div>
    <div class="container-box">
      <div class="text-xl">Justify Content</div>
      <div class="grid-box-long">
        <div class="flex-box justify-start bg-amber-100">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-center bg-amber-200">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-end bg-amber-300">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-between bg-amber-400">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-around bg-amber-500">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-evenly bg-amber-600">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>
      </div>
    </div>

    <div class="container-box">
      <div class="text-xl">Justify Items</div>
      <div class="grid-box-long">
        <div class="justify-items-start flex-box bg-amber-100">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box bg-amber-200">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box bg-amber-300">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box bg-amber-400">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-around bg-amber-500">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box justify-evenly bg-amber-600">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>
      </div>
    </div>

    <div class="container-box">
      <div class="text-xl">Align Content</div>
      <div class="grid-box-short">
        <div class="flex-box content-start bg-amber-100">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box content-center bg-amber-200">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box content-end bg-amber-300">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box content-between bg-amber-400">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>    <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>

        </div>

        <div class="flex-box content-around bg-amber-500">
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>
      </div>
    </div>

    <div class="container-box">
      <div class="text-xl">Align Items</div>
      <div class="grid-box-long">
        <div class="flex-box items-stretch bg-amber-100">
          <div class="item">1</div>
          <div class="item h-32">1</div>
          <div class="item h-16">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box items-start bg-amber-200">
          <div class="item">1</div>
          <div class="item h-32">1</div>
          <div class="item h-16">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box items-center bg-amber-300">
          <div class="item">1</div>
          <div class="item h-32">1</div>
          <div class="item h-16">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box items-end bg-amber-400">
          <div class="item">1</div>
          <div class="item h-32">1</div>
          <div class="item h-16">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

        <div class="flex-box items-baseline bg-amber-500">
          <div class="item">1</div>
          <div class="item h-32">1</div>
          <div class="item h-16">1</div>
          <div class="item">1</div>
          <div class="item">1</div>
        </div>

      </div>
    </div>

  </div>
</template>
<style
  scoped
>
.container-box {
  @apply mt-2 p-2 border-2 border-rose-500;
}

.grid-box-short {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5;
}

.grid-box-long {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.flex-box {
  @apply h-48 flex flex-wrap m-4;
}

.item {
  @apply w-8 p-2 border-2 border-cyan-900 m-2;
}


.grid > div {
  @apply m-2;
}
</style>
