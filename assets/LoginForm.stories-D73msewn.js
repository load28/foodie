import{r as i,R as e}from"./iframe-DeVPOllh.js";import{T as E}from"./TextField-DOFShQMS.js";import{B as y}from"./Button-BtUlYdzB.js";import"./preload-helper-D9Z9MdNV.js";const b=({onSubmit:t,isLoading:r=!1,error:g})=>{const[s,v]=i.useState(""),[n,S]=i.useState(""),[u,d]=i.useState(""),[f,p]=i.useState(""),_=a=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a),w=a=>{a.preventDefault(),d(""),p("");let o=!1;s?_(s)||(d("올바른 이메일 형식을 입력해주세요."),o=!0):(d("이메일을 입력해주세요."),o=!0),n?n.length<6&&(p("비밀번호는 최소 6자 이상이어야 합니다."),o=!0):(p("비밀번호를 입력해주세요."),o=!0),!o&&t&&t(s,n)};return e.createElement("div",{className:"login-form"},e.createElement("div",{className:"login-form__container"},e.createElement("div",{className:"login-form__header"},e.createElement("h1",{className:"login-form__title"},"로그인"),e.createElement("p",{className:"login-form__subtitle"},"FoodieShare에 오신 것을 환영합니다")),e.createElement("form",{className:"login-form__form",onSubmit:w},e.createElement("div",{className:"login-form__fields"},e.createElement(E,{label:"이메일",type:"email",variant:"bordered",placeholder:"이메일을 입력하세요",value:s,onChange:a=>v(a.target.value),state:u?"error":"default",errorMessage:u,disabled:r}),e.createElement(E,{label:"비밀번호",type:"password",variant:"bordered",placeholder:"비밀번호를 입력하세요",value:n,onChange:a=>S(a.target.value),state:f?"error":"default",errorMessage:f,disabled:r})),g&&e.createElement("div",{className:"login-form__error"},g),e.createElement(y,{type:"submit",variant:"primary",disabled:r,onClick:()=>{}},r?"로그인 중...":"로그인"))))};b.__docgenInfo={description:"",methods:[],displayName:"LoginForm",props:{onSubmit:{required:!1,tsType:{name:"signature",type:"function",raw:"(email: string, password: string) => void",signature:{arguments:[{type:{name:"string"},name:"email"},{type:{name:"string"},name:"password"}],return:{name:"void"}}},description:""},isLoading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"string"},description:""}}};const T={title:"Components/LoginForm",component:b,parameters:{layout:"fullscreen",viewport:{defaultViewport:"mobile1"}},argTypes:{onSubmit:{action:"submitted"},isLoading:{control:{type:"boolean"}},error:{control:{type:"text"}}}},l={args:{onSubmit:(t,r)=>{console.log("Login attempt:",{email:t,password:r})}}},m={args:{isLoading:!0,onSubmit:(t,r)=>{console.log("Login attempt:",{email:t,password:r})}}},c={args:{error:"잠시 후 다시 시도해주세요.",onSubmit:(t,r)=>{console.log("Login attempt:",{email:t,password:r})}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", {
        email,
        password
      });
    }
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true,
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", {
        email,
        password
      });
    }
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    error: "잠시 후 다시 시도해주세요.",
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", {
        email,
        password
      });
    }
  }
}`,...c.parameters?.docs?.source}}};const F=["Default","Loading","ServerError"];export{l as Default,m as Loading,c as ServerError,F as __namedExportsOrder,T as default};
