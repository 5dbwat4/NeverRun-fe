<template>
  <section class="about-page">
    <header class="heading-row">
      <h2>FAQs</h2>
    </header>
    <UCard>
      <div class="markdown-body">
        <p>Special thanks to @eWloYW8, who first come up with a ZDTY Reverse idea and a python script. The NeverRun project is built on this foundation.</p>
        <p>BTW, you can also try to reverse it. It's a little challenging but doable.</p>
        <h2>1. Will you steal my data?</h2>
        <p>No, all your data will not be stored in server. We are committed to protecting your privacy and ensuring that your information is secure. Everything persists locally on your device.</p>
        <h2>2. Can you tell me how NeverRun works?</h2>
        <p>To run in ZDTY, there are several steps involved. First, you need to begin to run; Second, you need to finish the run. -- That's what NeverRun does. ZDTY will complain if you don't follow the steps, like finish a run which was never started or started before you really start it.</p>
        <p>As you commonly run for exactly 30 min, you need to start the run ( get a sportId ) and wait 30 min to finish it ( submit the sport ).</p>
        <p>ZDTY allows you to make up a run at any time, so you can finish your run any time you want (instead of exactly 30 min after you start it)</p>
        <p>如果你要用浙大体艺跑步，那么你需要2个步骤：开始跑步，结束跑步——比把大象装进冰箱还要简单。NeverRun干的就是这件事，前者是Get a sportId，后者是Submit a sport。为什么这两步不能放在一起？因为浙大体艺会拒绝那些时间不匹配的跑步，例如，如果你要提交一个30min的记录，那它的开始时间必须要等于你获得sportId的时间（并且不能在未来结束），这意味着你至少要等30min才能提交你的跑步记录。但是，浙大体艺有补交功能，也就是说，只要过了这30min，你想啥时候交就可以啥时候交，你甚至可以每天request一个sportId，并在学期末一起提交掉。</p>
      </div>
    </UCard>
  </section>
</template>
<script setup>
import "github-markdown-css/github-markdown.css";
/**



 */
</script>
<style scoped>
.about-page {
  width: min(980px, 100%);
  margin: 0 auto;
}

.heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.heading-row h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: "Monomakh", system-ui;
}
</style>