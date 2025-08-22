<script
  lang="ts"
  setup
>


</script>

<template>
  <div class="h-screen w-screen p-8">
    <div class="text-2xl flex justify-center">弹性布局Flex</div>
    <div class="container-box">
      <div class="text-xl">Flex Direction</div>
      <div class="grid-box-long">
        <div>
          flex-row
          <div class="flex-box bg-amber-100 flex-row">
            <div class="item">1</div>
            <div class="item">2</div>
            <div class="item">3</div>
            <div class="item">4</div>
            <div class="item">5</div>
          </div>
        </div>
        <div>
          flex-row-reverse
          <div class="flex-box bg-amber-200 flex-row-reverse">
            <div class="item">1</div>
            <div class="item">2</div>
            <div class="item">3</div>
            <div class="item">4</div>
            <div class="item">5</div>
          </div>
        </div>
        <div>
          flex-col
          <div class="flex-box bg-amber-200 flex-col">
            <div class="item">1</div>
            <div class="item">2</div>
            <div class="item">3</div>
            <div class="item">4</div>
            <div class="item">5</div>
          </div>
        </div>
        <div>
          flex-col-reverse
          <div class="flex-box bg-amber-200 flex-col-reverse">
            <div class="item">1</div>
            <div class="item">2</div>
            <div class="item">3</div>
            <div class="item">4</div>
            <div class="item">5</div>
          </div>
        </div>

      </div>
    </div>

    <div class="container-box">
      <div class="text-xl">Flex</div>
      <div class="grid-box-long">
        <div>
          flex-initial
          <div class="flex-box bg-amber-100">
            <div class="item-2 flex-initial">1</div>
            <div class="item-2 flex-initial">2156165</div>
            <div class="item-2 flex-initial">3</div>
            <div class="item-2 flex-initial">4</div>
            <div class="item-2 flex-initial">5</div>
            <div class="item-2 flex-initial">1156151561</div>
          </div>
        </div>
        <div>
          flex-1: 1
          <div class="flex-box bg-amber-100">
            <div class="item-2 flex-1">1156151561</div>
            <div class="item-2">2156165</div>
            <div class="item-2">3</div>
            <div class="item-2">4</div>
            <div class="item-2">5</div>
          </div>
        </div>
        <div>
          flex-auto: 1 2 3 4 5
          <div class="flex-box bg-amber-100">
            <div class="item-2 flex-auto">1156151561</div>
            <div class="item-2 flex-auto">2156165</div>
            <div class="item-2 flex-auto">3</div>
            <div class="item-2 flex-auto">4</div>
            <div class="item-2 flex-auto">5</div>
          </div>
        </div>
        <div>
          flex-none: 3
          <div class="flex-box bg-amber-100">
            <div class="item-2 flex-none">1156151561</div>
            <div class="item-2 ">2156165</div>
            <div class="item-2 ">3</div>
            <div class="item-2 ">4</div>
            <div class="item-2 ">5</div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-box">
      <div class="text-xl">Flex Glow</div>
      <div class="grid-box-long">
        <div>
          flex-grow: 2
          <div class="flex-box bg-amber-100">
            <div class="item-2  w-32 h-32">1</div>
            <div class="item-2 flex-grow w-32 h-32">2</div>
            <div class="item-2  w-32 h-32">3</div>
          </div>
        </div>
        <div>
          flex-grow-0: 2
          <div class="flex-box bg-amber-100">
            <div class="item-2 flex-grow w-32 h-32">1</div>
            <div class="item-2 flex-grow-0 w-32 h-32">2</div>
            <div class="item-2 flex-grow w-32 h-32">3</div>
          </div>
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
  @apply flex flex-wrap m-4;
}

.item {
  @apply w-8 p-2 border-2 border-cyan-900 m-2;
}

.item-2 {
  @apply p-2 border-2 border-cyan-900 m-2;
}


.grid > div {
  @apply m-2;
}
</style>
