gulp-split-media-queries
--------------------------
This plugin splits all media queries above defined breakpoint into separated file. 

USAGE
-------
```js
const gulp = require('gulp');
const extractMediaQueries = require('gulp-split-media-queries');

gulp.task('build', function() {
    gulp.src('assets/styles/all.css')
    .pipe(extractMediaQueries({
        breakpoint: 1024, // default is 768
    }))
    .pipe(gulp.dest('build'));
});
```
`all.css` file:
``` css
.container {
    padding: 20px;
}

@media (min-width: 768px) {
    .container {
        padding: 10px 20px;
    }
}

@media (min-width: 1024px) {
    .container {
        padding: 30px;
    }
}

@media (min-width: 1280px) {
    .container {
        margin: 20px 0;
    }
}
```
This will be output:

<table>
	<tr>
		<th>all.css</th>
		<th>all-above-1024.css</th>
	</tr>
	<tr>
		<td><pre>.container {
    padding: 20px;
}
@media (min-width: 768px) {
    .container {
        padding: 10px 20px;
    }
}</pre></td>
<td><pre>@media (min-width: 1024px) {
    .container {
        padding: 30px;
    }
}    
@media (min-width: 1280px) {
    .container {
        margin: 20px 0;
    }
}</pre></td>
	</tr>
</table>

Include it in HTML:
```html
<link rel="stylesheet" type="text/css" href="all.css" />
<link rel="stylesheet" type="text/css" href="all-above-1024.css" media="(min-width: 1024px)" />
```