nest
https://www.youtube.com/watch?v=tC9llkCzvl8
https://www.youtube.com/watch?v=xzu3QXwo1BU&list=PL_cUvD4qzbkw-phjGK2qq0nQiGtjkwC9llkCzvl86gw1cKK
fireship

https://docs.nestjs.com/fundamentals/dynamic-modules#community-guidelines



# Nest

#### Nest CLI(Command Line Interface):
NestJS'i CLI  projemizi kurmaya,geliştirmeye ve maintain etmeye yardımcı olmak için kullanılır.
`npm i -g @nest/cli` : global olarak indirme yapar.

NestJS te CLI komutları aşağıdaki formatta olmalıdır.
`nest commandOrAlias requiredArg [optionalArg] [options]`;
Örnek olarak aşağıdaki komutları yapabiliriz:
`nest new first-project` : first-project isminde nesjs boilerplate oluşturur.
`nest new first-project --strict -s`  : first project isminde typescripti strict modta olan ve npm paketlerini indirmeyen bir proje oluşturur.

CLI komutlarını görmek için:
`nest --help`: nestjs komut listesini döndürür.
`nest new --help`: help komutunda hangi seçeneklerin olabileceğini gösterir
`nest i` : proje hakkındaki temel bilgileri verir.Nodejs versionu,Npm versiyonu,nestJS versiyonu
  


NestJS dökümanında pek çok kere belirtildiği gibi NestJS platform-agnostic yapıdadır.Yani Spesifik olarak Express veya Fastify için oluşturulmamıştır.Default HTTP Server Frameworku olarak Express kullanılır çünkü Express Fastifydan daha popüler bir kütüphanedir.Biz Fastify kullanacağımız için aşağıdaki customizasyonu yapmalıyız.
`npm uninstall platform-express`
`npm i platform-fastify`


```ts
//main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
```

Controllers: Belli bir route alanı içerisindeki routeların isteklerinin karşılandığı yerdir.Bir controllerda route prefixi olarak isimlendirilen bir path vardır mesela @Controller('user') dediğimizde user ile başlayan tüm istekler bu controller tarafından karşılanır.Controllerın içerisinde belirlenen prefixin kullanılacağı routerlar tanımlanır.

Routelarda her seferinde request,responseları parametre olarak belirlenmez,eğer spesifik olarak bir şey istenirse decoratorlar yardımı ile istenen şey alınabilir mesela `@Param() params: { id: number }` şeklinde parametreleri alabiliriz.Ayrıca aşağıdaki örneklerede bakabiliriz.
- @Param(key?:string): req.param | req.params[key].@Param() decoratoru ile params objesini alabiliriz yada @Param('id') diyerek req.params.id değerini alabiliriz.
- @Query(key?string):req.query | req.query[key]
- @Next() next callback function
- @Session() req.session 
daha fazlasına [tıklayarak](https://docs.nestjs.com/controllers#request-object) gidebilirsiniz.

```ts
import { Controller, Get, HttpCode, Param, HttpStatus } from '@nestjs/common';
@Controller()
export class TaskController {
  @Get(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  findAll(@Param() params: { id: number }) {
    return params.id;
  }
}
```
Default olarak POST istekleri 201,diğer tüm istekler 200 HTTP status codu ile döner.@HttpCode(code:number) ile HTTP status kodunu özelleştirebiliriz.

Response: Response değeri primative ise serialize edilmeden verilirken objeler JSON tipine serialize edilerek döndürülür.Bunun yanında Liblary-specific yöntemi ile res değerini res objesi üzerinden döndürebiliriz ancak bu tavsiye edilmez.Eğer res objesi gerekiyor ve res üzerinde işlemler yaptıktan sonra NestJS in serialize,HttpCode,Header işleminden faydalanmak için passthrough seçeneğini aktif etmeliyiz.

```ts
import {Controller,Get,HttpCode,Param,HttpStatus,Res} from '@nestjs/common';
import { FastifyReply } from 'fastify';
@Controller()
export class TaskController {
  @Get(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  findAll(
    @Param() params: { id: number },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    res.type('application/json');
    return params.id;
  }
}

```

Providers: Providers helpers,services,factories,repositories gibi pek çok terimi içerisinde barındıran ve temel olarak eklenti olarak injectable olabilen herhangi bir değere denir.Sadece class olmak zorunda değildir bir string,array de provider olabilir.

Service olarak kullanım örneği yapalım:
`nest g service user`
```ts
//user.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users: string[] = [];

  getNumbers() {
    return this.users;
  }

  addUser(username: string) {
    this.users.push(username);
  }
}

//user.controller.ts
import { Controller, Get, Scope, Post, Body } from '@nestjs/common';
import { TaskService } from './user.service';

@Controller({
  path: 'user',
})
export class UserController {
  text: string = '';
  constructor(private taskService: UserService) {}

  @Get()
  getUsers() {
    console.log(this.text);
    return this.taskService.getUsers();
  }

  @Post()
  addUser(@Body() body: { username: string }) {
    this.text += 'hi';
    this.taskService.addUser(body.username);

    return true;
  }
}
```

Yukarıdaki kodta kullanıcıları kendi içerisinde tutan ve kullanıcı ekleme,listeleme servislerinin bulunduğu örnek bulunmaktadır.Ayrıca her listeleme isteğinde text değerine 'hi' eklenerek consola yazılmaktadır.Peki 3 kere addUser isteği attıktan sonra listeleme isteği nasıl döner ?
/user
```json
[
  "cibilex",
  "cibilex",
  "cibilex"
]
```
in terminal: 'hihihi'
Peki controller lifetimeın request bazlı olmasını istersem ne yapmalıyım ?
Bunun için controllerın scopunu requested-scope yapabiliriz.Bunun için 
```ts
@Controller({
  path: 'user',
  scope: Scope.REQUEST,
})
```
yeterli olacaktır.Böylece her istekte NestJS UserController classını yeniden oluşturur aynı işlemi yaptıktan sonra aşağıdaki sonuçları görürüz.
/user
```json
[
  "cibilex",
  "cibilex",
  "cibilex"
]
```
in terminal: ''

Peki Service providerıda aynı mantıkla yapabilir miyiz?
cevabı evet.Bunun için 
```ts
@Injectable({
  scope: Scope.REQUEST,
})
```
yapılır.Bunu yaptıktan sonra aynı istekleri atarsak aşağıdaki sonuçları elde ederiz.
```json
[]
```
in terminal: ''

Bu işlem uygulamayı %5+ civarında yavaşlatabilir çünkü her istekte provider ve controllerlar yeniden oluşturulur,buda devasa bir ek yük getirir uygulamaya.

belirli bir scopu olan bir providerın tüm consumerlarıda aynı scopu otomatik olarak alır.Yani scope:Scope.REQUEST olan bir servisin kullanıldığı tüm controllerlar otomatik olarak scope:Scope.REQUST olur.Ancak bu providerın kullandığı başka providerlar etkilenmez!.Yukarıdaki örnek gibi Controllerı scope:Scope.REQUEST yapmamıza rağmen UserService scope:Scope.DEFAULT olmaya devam etti.


3 tane provider scopu vardır:
1. DEFAULT: singleton modelinde,uygulama düzeyinde lifetime olur.
2. REQUEST: Her incoming request te yeni bir instance oluşturur.
3. TENSIENT: Her customer için yeni bir instance oluşturur.Yani customerlar arasında ortak bir instance olmaz.



Iof(Inversion of control):Yazdığımız kod doğrudan çalışmaz,NestJS Ioc(inversion of control) container tarafından çalıştırılır.Her bir Modulü bir Iof container olarak düşünebiliriz.
Modulde bulunan her controller üzerinde gezinerek istenilen bir provider var mı yok mu kontrol edilir.Var ise provider scopuna bağlı olarak oluşturulur,cachlenir ,yeniden oluşturulur veya var ise varolan instance döndürülür.


```ts
    providers: [
    {
      provide: UserService,
      useClass: UserService,
    },
  ]

    providers: [UserService] // easy way
```

Yukardaki iki tanımlama aynı şeyi yapar.
provide: Kullanılacak providerın tok
enını temsil eder.Controllerlarda inject edilip edilmeyeceği bu token üzerinden kontrol edilir.
useClass: Örneği oluşturulacak classı temsil eder.

Bu yöntem ile classlar yerine sabit constant değerlerde kullanabiliriz.Bunun için useClass yerine useValue kullanmalıyız.

```ts
// user.module.ts
export const admins = ['cibilex', 'carl'];

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'admins',
      useValue: admins,
    },
  ],
})

//user.controller.ts
  constructor(@Inject('admins') private adminsUsers: typeof admins) {}

```
Böylece sabit değerleride DI ile controllerlara aktarabiliriz.

Diğer provider tipleri aşağıdadır:
- [Factory Providers](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory): Dinamik olarak değer veya class döndürmek için kullanılırlar.
- [Alias Providers](https://docs.nestjs.com/fundamentals/custom-providers#alias-providers-useexisting): Bir providerı birden çok kere vermek için kullanılır.İlk provider dışındakilere aşağıdaki gibi bir alias atanır.

```ts
  providers: [
    UserController,
    {
      provide: 'service',
      useExisting: UserService,
    },
  ]
```


NestJS async/await veya Promise yapısı ile asynchronous providerlar tanımlamamıza izin verir.Bu providerlar tamamlanmadan controllerlara inject edilmez.

inquirer providers
https://docs.nestjs.com/fundamentals/injection-scopes


Modules

Bir NestJS uygulaması en az bir modul içerir ve genel olarak appModule olarak adlandırılır.Ana module eklemeler yaparak uygulama geliştirilir.Default olarak Bir modüldeki providerslar o module scopuna aittir yani kendisi dışındaki controllerlar bu modulu kullanamaz.
![modules](https://docs.nestjs.com/assets/Modules_1.png)
Bir module @Module decoratoru ile tanımlanır ve aşağıdaki özelliklere sahiptir.      
imports: Bu modul için gerekli olan başka moduller buraya yazılır.Import edilen modullerin exports kısmındaki providerları ,bu moduldeki controllerlar tarafından kullanılabilir.     
Providers: Controller veya modulun kendi classında kullanılmak üzere injectable değerleri temsil eder.         
Controllers: Kullanılacak controllerlar yazılır.         
exports: import edilecek kısımlarda kullanılabilecek providerları temsil eder.Providerın kendisi veya providerın içerisindeki provide değeri yazılabilir.      
 

```ts
// src/user/user.module
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [UserController],
  providers: [UserService],
})


// src/task/task.module
@Module({
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})

```

Yukarıdaki örnekte TaskModulun kendisi veya controllerı TaskService kullanabilir hale geldi.

Eğer bir module çoğu yerde kullanılacaksa global module haline getirilebilir böylece  heryerde import etmeye gerek kalmaz.Bunun için @Global decoratoru kullanılır.

```ts
@Global()
@Module({
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
```

Dyamic Modules
Bir modul oluştulurken import edildiği yerde bazı özellikler verilerek özelleştirme işlemleri yapılabilir.Verilen Özelliklere göre bir Module oluşumu için dinamik modüller kullanılabilir.
Dynamic modulde ismi arbitary olarak verilmiş ve return değeri module değeri haricinde static bir modulun aynısı olan bir static fonksiyon bulunur.module değeri bulunduğu classı temsil eder.Projemizdeki Environmentleri herseferinde process.env ile kullanmak yerine ortak bir config objesi üzerinden kullanmak için aşağıdaki gibi bir dinamik mödül oluşturabiliriz.

```ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

@Module({})
export class Env {
  private static config: dotenv.DotenvParseOutput;
  constructor() {}
  static register({
    global,
    path,
  }: {
    global?: boolean;
    path?: string;
  } = {}): DynamicModule {
    Env.config =
      dotenv.config({
        path: path || resolve(process.cwd(), '.env'),
      }).parsed || {};

    const providers: Provider[] = [
      {
        provide: 'DOTENV',
        useValue: Env.config,
      },
    ];

    return {
      module: Env,
      global,
      providers,
      exports: providers,
    };
  }

  static get(key: string): string | undefined {
    return Env.config[key];
  }
}
```

Kullanmak için app.module.ts dosyamızda aşağıdaki gibi import edebiliriz.

```ts
import { Module } from '@nestjs/common';
import { Env } from './lib/env';

@Module({
  imports: [
    Env.register({
      global: true,
    }),
  ],
  controllers: [],
})
export class AppModule {}
```

Böylece heryerde Env.get fonksiyonu ile environment değerimizi alabiliriz.Ayrıca dikkat ederseniz path seçeneği ile istediğimiz dosyayı env dosyası olarakta seçebiliriz.
[@Nest/config](https://github.com/nestjs/config/tree/master ) paketide temel olarak bu yapıda olmakla beraber çok daha ayrıntılı ve ekstra özellikler sunmaktadır.

Nestjs paketlerinde genelde yaygın olarak kullanılan 3 static funksiyon ismi vardır.
1. **register**: Belli configurasyonlar ile projede istenildiği kadar module çağırabilir.
2. **forRoot**: Belli configurasyonlar ile projede sadece 1 kere çalıştırılacak static method.
3. **forFeature**: Hali hazırda forRoot ile çalıştırılmış bir modulun configurasyonlarını güncellemek için kullanılır.
   
Yani bizim yukarda yaptığımız register fonksiyonunu forRoot olarak değiştirmemiz daha iyi olacaktır.
