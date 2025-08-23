import{R as e}from"./iframe-DeVPOllh.js";import{T as r}from"./TextField-DOFShQMS.js";import"./preload-helper-D9Z9MdNV.js";const i={title:"Components/TextField",component:r,parameters:{layout:"padded"},argTypes:{variant:{control:{type:"select"},options:["underline","bordered"]},state:{control:{type:"select"},options:["default","error","success"]},disabled:{control:"boolean"},label:{control:"text"},placeholder:{control:"text"},value:{control:"text"},type:{control:{type:"select"},options:["text","email","password","tel","url"]}}},l={args:{variant:"underline",label:"맛집 이름",placeholder:"맛집 이름을 적어주세요"}},s={args:{variant:"bordered",label:"이메일",placeholder:"이메일 주소를 입력해주세요",type:"email"}},t={args:{variant:"bordered",state:"error",label:"비밀번호",placeholder:"비밀번호를 입력해주세요",type:"password",value:"123",errorMessage:"비밀번호는 8자 이상이어야 합니다."}},o={args:{variant:"bordered",state:"success",label:"닉네임",placeholder:"닉네임을 입력해주세요",value:"푸디러버",successMessage:"사용 가능한 닉네임입니다."}},d={args:{variant:"bordered",label:"사용자 ID",placeholder:"자동 생성됩니다",disabled:!0}},a=()=>e.createElement("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"}},e.createElement(r,{variant:"underline",label:"언더라인 스타일",placeholder:"맛집 이름을 적어주세요"}),e.createElement(r,{variant:"bordered",label:"테두리 스타일",type:"email",placeholder:"이메일 주소를 입력해주세요"}),e.createElement(r,{variant:"bordered",state:"error",label:"에러 상태",type:"password",placeholder:"비밀번호를 입력해주세요",defaultValue:"123",errorMessage:"비밀번호는 8자 이상이어야 합니다."}),e.createElement(r,{variant:"bordered",state:"success",label:"성공 상태",placeholder:"닉네임을 입력해주세요",defaultValue:"푸디러버",successMessage:"사용 가능한 닉네임입니다."}),e.createElement(r,{variant:"bordered",label:"비활성화",placeholder:"자동 생성됩니다",disabled:!0}));a.__docgenInfo={description:"",methods:[],displayName:"AllVariants"};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'underline',
    label: '맛집 이름',
    placeholder: '맛집 이름을 적어주세요'
  }
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'bordered',
    label: '이메일',
    placeholder: '이메일 주소를 입력해주세요',
    type: 'email'
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'bordered',
    state: 'error',
    label: '비밀번호',
    placeholder: '비밀번호를 입력해주세요',
    type: 'password',
    value: '123',
    errorMessage: '비밀번호는 8자 이상이어야 합니다.'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'bordered',
    state: 'success',
    label: '닉네임',
    placeholder: '닉네임을 입력해주세요',
    value: '푸디러버',
    successMessage: '사용 가능한 닉네임입니다.'
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'bordered',
    label: '사용자 ID',
    placeholder: '자동 생성됩니다',
    disabled: true
  }
}`,...d.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`() => <div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  maxWidth: '400px'
}}>
    <TextField variant="underline" label="언더라인 스타일" placeholder="맛집 이름을 적어주세요" />
    <TextField variant="bordered" label="테두리 스타일" type="email" placeholder="이메일 주소를 입력해주세요" />
    <TextField variant="bordered" state="error" label="에러 상태" type="password" placeholder="비밀번호를 입력해주세요" defaultValue="123" errorMessage="비밀번호는 8자 이상이어야 합니다." />
    <TextField variant="bordered" state="success" label="성공 상태" placeholder="닉네임을 입력해주세요" defaultValue="푸디러버" successMessage="사용 가능한 닉네임입니다." />
    <TextField variant="bordered" label="비활성화" placeholder="자동 생성됩니다" disabled />
  </div>`,...a.parameters?.docs?.source}}};const u=["Underline","Bordered","Error","Success","Disabled","AllVariants"];export{a as AllVariants,s as Bordered,d as Disabled,t as Error,o as Success,l as Underline,u as __namedExportsOrder,i as default};
