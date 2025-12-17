# /bin/bash
# <-----User Defined variables------>
# Functions
x=10
myfunc(){
    local y=20
    echo $x $y 
}
myfunc
