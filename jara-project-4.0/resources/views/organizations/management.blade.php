<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Organization Management</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}
    ">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <style>
        .container {
            padding: 2rem 0rem;
        }

        h4 {
            margin: 2rem 0rem 1rem;
        }

        .table-image {
            td, th {
                vertical-align: middle;
            }
        }
        table{
            background-color: #f1f1f1;
            
        }
        table th,td{ text-align: center; }
        .table-striped>tbody>tr:nth-of-type(odd) {
            background-color: #f9f9f9;
        }
        .do-scroll{
            width: 100%;
            height: 220px; 
            display: -moz-grid;
            overflow-y: scroll;
        }
    </style>
    
</head>
<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey"
        style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href={{route('my-page')}}>マイページ</a>
            <a href={{route('user.edit')}}>情報更新</a>
            <a href={{route('user.details')}}>情報参照</a>
            <a href={{route('user.delete')}}>退会</a>
            <a href={{route('user.password-change')}}>パスワード変更</a>
            <a href={{route('player.register')}}>選手情報登録</a>
            <a href={{route('player.edit')}}>選手情報更新</a>
            <a href={{route('player.delete')}}>選手情報削除</a>
            <a href={{route('organization.management')}}>団体管理</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
    
                <a href="route('logout')" onclick="event.preventDefault();
                                    this.closest('form').submit();">
                    ログアウト
                </a>
            </form>
        </div>
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">
                団体管理
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <div></div>
        <div class="container">
            <div class="row">
                <div class="col-12" style="text-align: right;margin:2rem 0rem" >
                    <a role="button" style="width: 150px;height:60px; font-size:28px" class="btn btn-success" href="{{route('organizations.register')}}">
                        団体登録
                    </a>
                </div>
                <div class="col-12" >
                    <table class="table table-striped table-bordered" >
                        <thead>
                            <tr>
                            <th scope="col">団体種別</th>
                            <th scope="col">エントリーシステムのID</th>
                            <th scope="col">団体ID</th>
                            <th scope="col">団体名</th>
                            <th scope="col" colspan="2">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($organizations as $organization)
                            <tr>
                                {{-- <th>{{$user->id}}</th>
                                <th>{{$user->name}}</th> --}}
                                {{-- <th scope="row">公式</th> --}}
                                <td>
                                    {{$organization->jara_org_type}}
                                </td>
                                <td>
                                    <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                        {{$organization->entrysystem_org_id}}
                                    </a>
                                </td>
                                <td>    
                                    <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                        {{$organization->org_id }}
                                    </a>
                                </td>
                                <td>
                                    <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                        {{$organization->org_name}}
                                    </a>
                                </td>
                                <td>
                                    <a href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}" role="button" class="btn btn-primary" >更新</a>
                                </td>
                                <td>
                                    {{-- {{route('organizations.delete',['targetOrgId' => $organization->org_id])}} --}}
                                    <a role = "button" href="#" class="btn btn-danger" >削除</a>
                                    
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="col-12" style="text-align: right;margin:2rem 0rem" >
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">戻る</a>
                </div>
            </div>
        </div>

    </div>
    {{-- <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script> --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>
    <script>
        $(document).ready(function(){
        var rowCount = $('tbody tr').length;
        if(rowCount > 1){
            console.log(rowCount);
            $('table').addClass('do-scroll');
        }
        });
    </script>
   

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>