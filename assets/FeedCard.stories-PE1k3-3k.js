import{r as i,R as e}from"./iframe-DeVPOllh.js";import{A as b}from"./Avatar-Bxq-CCgv.js";import"./preload-helper-D9Z9MdNV.js";/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),I=a=>a.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,n,r)=>r?r.toUpperCase():n.toLowerCase()),N=a=>{const t=I(a);return t.charAt(0).toUpperCase()+t.slice(1)},k=(...a)=>a.filter((t,n,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===n).join(" ").trim(),T=a=>{for(const t in a)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var q={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=i.forwardRef(({color:a="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:s="",children:o,iconNode:p,...c},f)=>i.createElement("svg",{ref:f,...q,width:t,height:t,stroke:a,strokeWidth:r?Number(n)*24/Number(t):n,className:k("lucide",s),...!o&&!T(c)&&{"aria-hidden":"true"},...c},[...p.map(([g,h])=>i.createElement(g,h)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(a,t)=>{const n=i.forwardRef(({className:r,...s},o)=>i.createElement(x,{ref:o,iconNode:t,className:k(`lucide-${A(N(a))}`,`lucide-${a}`,r),...s}));return n.displayName=N(a),n};/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],V=_("heart",L);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],S=_("message-circle",R);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M12 2v13",key:"1km8f5"}],["path",{d:"m16 6-4-4-4 4",key:"13yo43"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}]],M=_("share",$),y=({authorName:a="작성자",authorInitial:t="작",timeAgo:n="방금 전",title:r="맛집 후기",content:s="정말 맛있었어요!",location:o="맛집 위치",showRating:p=!1,rating:c=4.5,likes:f=0,comments:g=0,onLike:h,onComment:E,onShare:C,isLiked:v=!1,...w})=>e.createElement("div",{className:"ds-feed-card ds-feed-card--compact",...w},e.createElement("div",{className:"ds-feed-card__header"},e.createElement(b,{size:"small",color:"secondary",className:"ds-feed-card__avatar"},t),e.createElement("div",{className:"ds-feed-card__author-info"},e.createElement("div",{className:"ds-feed-card__author"},a),e.createElement("div",{className:"ds-feed-card__time"},n))),e.createElement("div",{className:"ds-feed-card__content"},e.createElement("h3",{className:"ds-feed-card__title"},r),e.createElement("p",{className:"ds-feed-card__text"},s),p&&e.createElement("div",{className:"ds-rating"},e.createElement("div",{className:"ds-rating__stars"},"⭐".repeat(Math.floor(c))),e.createElement("div",{className:"ds-rating__score"},c)),e.createElement("div",{className:"ds-feed-card__location"},"📍 ",o)),e.createElement("div",{className:"ds-feed-card__actions"},e.createElement("button",{className:`ds-feed-card__action ${v?"ds-feed-card__action--active":""}`,onClick:h},e.createElement(V,{size:18,fill:v?"currentColor":"none",stroke:"currentColor"}),e.createElement("span",{className:"ds-feed-card__action-count"},f)),e.createElement("button",{className:"ds-feed-card__action",onClick:E},e.createElement(S,{size:18}),e.createElement("span",{className:"ds-feed-card__action-count"},g)),e.createElement("button",{className:"ds-feed-card__action",onClick:C},e.createElement(M,{size:18}))));y.__docgenInfo={description:"",methods:[],displayName:"FeedCard",props:{authorName:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'작성자'",computed:!1}},authorInitial:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'작'",computed:!1}},timeAgo:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'방금 전'",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'맛집 후기'",computed:!1}},content:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'정말 맛있었어요!'",computed:!1}},location:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'맛집 위치'",computed:!1}},showRating:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},rating:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4.5",computed:!1}},likes:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},comments:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},onLike:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onComment:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onShare:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},isLiked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const F={title:"Components/FeedCard",component:y,parameters:{layout:"padded"},argTypes:{authorName:{control:"text"},authorInitial:{control:"text"},timeAgo:{control:"text"},title:{control:"text"},content:{control:"text"},location:{control:"text"},showRating:{control:"boolean"},rating:{control:{type:"range",min:1,max:5,step:.1}},likes:{control:"number"},comments:{control:"number"},isLiked:{control:"boolean"}}},l={args:{authorName:"이영희",authorInitial:"이",timeAgo:"1시간 전",title:"신선한 회 맛집 발견!",content:"오마카세 코스가 정말 훌륭했어요. 회도 신선하고 사장님도 친절하셨습니다.",location:"서초구 방배동 바다횟집",likes:8,comments:1}},d={args:{authorName:"김철수",authorInitial:"김",timeAgo:"30분 전",title:"맛있는 이탈리안 레스토랑",content:"크림 파스타가 정말 환상적이었어요. 친구들과 함께 가기 좋은 분위기였습니다.",location:"강남구 논현동 맘마미아",showRating:!0,rating:4.8,likes:12,comments:3}},m={args:{authorName:"박민수",authorInitial:"박",timeAgo:"2시간 전",title:"숨은 맛집 발견",content:"동네 골목에 숨어있는 정말 맛있는 집이에요. 사장님이 직접 만드시는 음식이 일품입니다.",location:"홍대입구 골목집",likes:24,comments:7,isLiked:!0}},u={args:{authorName:"최유진",authorInitial:"최",title:"브런치 맛집",content:"주말 브런치로 완벽한 곳이에요. 팬케이크가 특히 맛있습니다.",location:"강남구 브런치카페",likes:5,comments:2,onLike:()=>console.log("좋아요 클릭"),onComment:()=>console.log("댓글 클릭"),onShare:()=>console.log("공유 클릭")}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    authorName: '이영희',
    authorInitial: '이',
    timeAgo: '1시간 전',
    title: '신선한 회 맛집 발견!',
    content: '오마카세 코스가 정말 훌륭했어요. 회도 신선하고 사장님도 친절하셨습니다.',
    location: '서초구 방배동 바다횟집',
    likes: 8,
    comments: 1
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    authorName: '김철수',
    authorInitial: '김',
    timeAgo: '30분 전',
    title: '맛있는 이탈리안 레스토랑',
    content: '크림 파스타가 정말 환상적이었어요. 친구들과 함께 가기 좋은 분위기였습니다.',
    location: '강남구 논현동 맘마미아',
    showRating: true,
    rating: 4.8,
    likes: 12,
    comments: 3
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    authorName: '박민수',
    authorInitial: '박',
    timeAgo: '2시간 전',
    title: '숨은 맛집 발견',
    content: '동네 골목에 숨어있는 정말 맛있는 집이에요. 사장님이 직접 만드시는 음식이 일품입니다.',
    location: '홍대입구 골목집',
    likes: 24,
    comments: 7,
    isLiked: true
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    authorName: '최유진',
    authorInitial: '최',
    title: '브런치 맛집',
    content: '주말 브런치로 완벽한 곳이에요. 팬케이크가 특히 맛있습니다.',
    location: '강남구 브런치카페',
    likes: 5,
    comments: 2,
    onLike: () => console.log('좋아요 클릭'),
    onComment: () => console.log('댓글 클릭'),
    onShare: () => console.log('공유 클릭')
  }
}`,...u.parameters?.docs?.source}}};const B=["Default","WithRating","Liked","Interactive"];export{l as Default,u as Interactive,m as Liked,d as WithRating,B as __namedExportsOrder,F as default};
